import awsmobile from "@/config/aws-exports";
import { getUrl } from "aws-amplify/storage";

const bucketName = awsmobile.aws_user_files_s3_bucket || "petwellclientstoragee8eec-prod";
const region = awsmobile.aws_user_files_s3_bucket_region || "ap-southeast-1";
const FORUM_IMAGE_PREFIX = "forum-images/";

export const buildPublicStorageUrl = (imageKey: string): string => {
  const normalizedKey = imageKey.replace(/^\/+/, "").replace(/^public\//, "");
  return `https://${bucketName}.s3.${region}.amazonaws.com/public/${normalizedKey}`;
};

export const buildForumImageUrl = (imageKey: string): string => buildPublicStorageUrl(imageKey);

export const extractStorageKeyFromPathname = (pathname: string): string | null => {
  const decodedPath = decodeURIComponent(pathname);
  const publicPrefix = "/public/";

  if (decodedPath.includes(publicPrefix)) {
    return decodedPath.slice(decodedPath.indexOf("/public/") + "/public/".length);
  }

  const knownPrefixes = ["/forum-images/", "/posts/", "/reply-images/"];
  for (const prefix of knownPrefixes) {
    if (decodedPath.includes(prefix)) {
      return decodedPath.slice(decodedPath.indexOf(prefix) + 1);
    }
  }

  return null;
};

export const normalizeForumImageUrl = (rawUrl: string): string => {
  const cleanedUrl = rawUrl.trim().replace(/&amp;/g, "&");
  if (!cleanedUrl) return "";

  if (!cleanedUrl.startsWith("http")) {
    return cleanedUrl;
  }

  try {
    const parsedUrl = new URL(cleanedUrl);
    const forumImageKey = extractStorageKeyFromPathname(parsedUrl.pathname);

    if (forumImageKey?.startsWith(FORUM_IMAGE_PREFIX)) {
      return buildForumImageUrl(forumImageKey);
    }

    return cleanedUrl;
  } catch {
    return cleanedUrl;
  }
};

export const resolveStorageImageUrl = async (rawReference: string): Promise<string> => {
  const cleanedReference = rawReference.trim().replace(/&amp;/g, "&");
  if (!cleanedReference) return "";

  let storageKey: string | null = null;

  if (cleanedReference.startsWith("http")) {
    try {
      const parsedUrl = new URL(cleanedReference);
      storageKey = extractStorageKeyFromPathname(parsedUrl.pathname);
    } catch {
      storageKey = null;
    }
  } else {
    storageKey = cleanedReference.replace(/^\/+/, "").replace(/^public\//, "");
  }

  if (!storageKey) {
    return cleanedReference;
  }

  try {
    const { url } = await getUrl({
      key: storageKey,
      options: {
        accessLevel: "guest",
      },
    });

    return url.toString();
  } catch {
    return buildPublicStorageUrl(storageKey);
  }
};
