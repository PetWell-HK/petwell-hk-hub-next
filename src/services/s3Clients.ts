type LambdaResponse<T = unknown> = {
    status: number;
    ok: boolean;
    data?: T;
    error?: string;
};

/** In-memory signed URL cache so list cards do not re-hit the signer Lambda. */
const SIGNED_URL_TTL_MS = 45 * 60 * 1000; // signed URLs typically last ~1h; refresh early
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const signedUrlInflight = new Map<string, Promise<LambdaResponse<{ url: string }>>>();

function signedUrlCacheKey(bucket: string, filePath: string): string {
    return `${bucket}::${filePath}`;
}

function getCachedSignedUrl(bucket: string, filePath: string): string | null {
    const key = signedUrlCacheKey(bucket, filePath);
    const entry = signedUrlCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        signedUrlCache.delete(key);
        return null;
    }
    return entry.url;
}

function setCachedSignedUrl(bucket: string, filePath: string, url: string): void {
    signedUrlCache.set(signedUrlCacheKey(bucket, filePath), {
        url,
        expiresAt: Date.now() + SIGNED_URL_TTL_MS,
    });
}

/**
 * Call a configured AWS Lambda endpoint with bucket and path.
 * Dedupes concurrent requests and caches successful signed URLs in-memory.
 * @param bucket S3 bucket name
 * @param filePath   object key / path in the bucket
 * @param timeoutMs optional request timeout in milliseconds (default 10000)
 */
export async function getImageUrl<T = unknown>(
    bucket: string,
    filePath: string,
    timeoutMs = 10_000
): Promise<LambdaResponse<T>> {
    if (!bucket || !filePath) {
        throw new Error('bucket and path are required');
    }

    const cachedUrl = getCachedSignedUrl(bucket, filePath);
    if (cachedUrl) {
        return { status: 200, ok: true, data: { url: cachedUrl } as T };
    }

    const cacheKey = signedUrlCacheKey(bucket, filePath);
    const existing = signedUrlInflight.get(cacheKey);
    if (existing) {
        return existing as Promise<LambdaResponse<T>>;
    }

    const endpoint = "https://lfvsh5wskvkgo5mepbh5ahokua0nkceb.lambda-url.ap-southeast-1.on.aws/";
    if (!endpoint) {
        throw new Error('LAMBDA_ENDPOINT environment variable is not set');
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const request = (async (): Promise<LambdaResponse<{ url: string }>> => {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                signal: controller.signal,
                body: JSON.stringify({ bucket, filePath }),
            });

            const text = await res.text();
            let parsed: { url?: string } | string | undefined;
            try {
                parsed = text ? (JSON.parse(text) as { url?: string }) : undefined;
            } catch {
                parsed = text;
            }

            if (!res.ok) {
                return {
                    status: res.status,
                    ok: false,
                    error: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
                };
            }

            const url =
                typeof parsed === 'object' && parsed && typeof parsed.url === 'string'
                    ? parsed.url
                    : null;
            if (url) {
                setCachedSignedUrl(bucket, filePath, url);
                return { status: res.status, ok: true, data: { url } };
            }

            return {
                status: res.status,
                ok: false,
                error: 'Signed URL response missing url',
            };
        } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') {
                return { status: 0, ok: false, error: `request timed out after ${timeoutMs}ms` };
            }
            return { status: 0, ok: false, error: (err as Error)?.message ?? String(err) };
        } finally {
            clearTimeout(id);
            signedUrlInflight.delete(cacheKey);
        }
    })();

    signedUrlInflight.set(cacheKey, request);
    return request as Promise<LambdaResponse<T>>;
}

// S3 Configuration (hardcoded, public)
const DEFAULT_BUCKET = 'petwell-uploads';
const DEFAULT_REGION = 'ap-southeast-1';

/**
 * Upload a file to AWS S3 using public upload (no authentication required)
 * This uses S3 REST API directly for unsigned requests
 * @param file File to upload
 * @param key S3 object key/path (e.g., 'payment-proofs/filename.jpg')
 * @param bucket S3 bucket name (defaults to DEFAULT_BUCKET)
 * @returns URL of the uploaded file
 */
export async function uploadToS3(
    file: File,
    key: string,
    bucket: string = DEFAULT_BUCKET
): Promise<string> {
    try {
        // Encode each path segment to handle special characters in filenames
        // Keep slashes unencoded as they are path separators
        const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/');
        
        // Construct S3 endpoint URL
        // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
        const uploadUrl = `https://${bucket}.s3.${DEFAULT_REGION}.amazonaws.com/${encodedKey}`;

        // Upload file directly using PUT request (unsigned, public upload)
        // The bucket must be configured to allow public PUT operations
        // Note: If bucket policy requires encryption, add 'x-amz-server-side-encryption' header
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
                // Try adding encryption header if bucket policy requires it
                // If this causes issues, remove the Condition from bucket policy instead
                'x-amz-server-side-encryption': 'AES256',
            },
            body: file,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Return the public URL (use encoded key for consistency)
        return uploadUrl;
    } catch (error: any) {
        console.error('Error uploading file to S3:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}