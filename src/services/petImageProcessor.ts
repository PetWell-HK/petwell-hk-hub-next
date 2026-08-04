/**
 * Pet Image Processing Service
 * Handles background removal and head extraction for pet photos
 */

/**
 * Process pet image to remove background and optionally extract head region
 * 
 * IMPORTANT: @imgly/background-removal only removes backgrounds.
 * It does NOT support head detection or cropping.
 * 
 * For head extraction, use extractPetHead() which requires Lambda backend.
 * 
 * @param imageFile The uploaded pet photo file
 * @param options Processing options
 * @returns Processed image as Blob with transparent background
 */
export async function processPetImage(
  imageFile: File,
  options: {
    removeBackground?: boolean;
    extractHead?: boolean; // Note: Requires Lambda backend, not supported client-side
  } = {}
): Promise<{ blob: Blob; dataUrl: string }> {
  const { removeBackground = true, extractHead = false } = options;

  try {
    let processedBlob: Blob;

    if (extractHead) {
      // Head extraction requires Lambda backend
      const result = await extractPetHead(imageFile);
      processedBlob = result.blob;
    } else if (removeBackground) {
      // Option 1: Use client-side background removal (privacy-friendly)
      processedBlob = await removeBackgroundClientSide(imageFile);
    } else {
      // No processing, return original
      processedBlob = imageFile;
    }

    // Convert to data URL for preview
    const dataUrl = await blobToDataUrl(processedBlob);

    return { blob: processedBlob, dataUrl };
  } catch (error) {
    console.error('Error processing pet image:', error);
    // Fallback: return original image
    const dataUrl = await fileToDataUrl(imageFile);
    return { blob: imageFile, dataUrl };
  }
}

/**
 * Remove background using client-side library
 * Falls back to Lambda backend if library not available
 */
async function removeBackgroundClientSide(imageFile: File): Promise<Blob> {
  try {
    // Try to use @imgly/background-removal if available
    // Dynamic import to avoid bundle size if not needed
    const backgroundRemovalModule = await import('@imgly/background-removal').catch(() => null);
    
    if (!backgroundRemovalModule) {
      throw new Error('Background removal library not available');
    }
    
    const { removeBackground } = backgroundRemovalModule;
    const imageBlob = new Blob([imageFile], { type: imageFile.type });
    const resultBlob = await removeBackground(imageBlob);
    return resultBlob;
  } catch (error) {
    console.warn('Client-side background removal failed, trying Lambda backend:', error);
    // Fallback: Use AWS Lambda backend
    try {
      return await removeBackgroundViaLambda(imageFile);
    } catch (lambdaError) {
      console.error('Lambda backend also failed:', lambdaError);
      // Final fallback: return original image
      throw new Error('Background removal unavailable. Please try again or upload an image with a plain background.');
    }
  }
}

/**
 * Remove background via AWS Lambda backend (for production)
 * This keeps API keys secure
 */
async function removeBackgroundViaLambda(imageFile: File): Promise<Blob> {
  // Convert file to base64
  const base64 = await fileToBase64(imageFile);

  // Call Lambda function
  // Lambda function: petHeadDetection-prod
  const lambdaEndpoint = 'https://ndwhcwrkqtlxkbgw7bnzr2cyce0drxzt.lambda-url.ap-southeast-1.on.aws/';

  const response = await fetch(lambdaEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64,
      type: imageFile.type,
      action: 'remove-background',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Background removal failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // Lambda now returns S3 URL (new format) or base64 (old format for backward compatibility)
  if (result.backgroundRemovedUrl) {
    // New format: Fetch from S3
    const imageResponse = await fetch(result.backgroundRemovedUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from S3: ${imageResponse.statusText}`);
    }
    return await imageResponse.blob();
  } else if (result.image) {
    // Old format: base64 (for backward compatibility)
    return base64ToBlob(result.image, 'image/png');
  } else {
    throw new Error('Invalid response format from Lambda. Expected backgroundRemovedUrl or image.');
  }
}

/**
 * Extract pet head region using face detection
 * 
 * Note: @imgly/background-removal does NOT support head detection.
 * This function uses Lambda backend with AWS Rekognition or similar service.
 * 
 * The Lambda function returns S3 URLs for the processed images:
 * {
 *   "imageUrl": "https://s3.../original-image.jpg",
 *   "polygonOutline": [{ "x": 100, "y": 150 }, { "x": 200, "y": 150 }, ...] // Preferred: polygon outline from landmarks
 *   "bounds": { "x": 100, "y": 150, "width": 200, "height": 200 } // Fallback: rectangle bounds
 * }
 * 
 * Priority: polygonOutline (from Rekognition landmarks) > bounds (if polygon array) > bounds (if rectangle)
 * The function uses polygonOutline when available for more accurate head shape detection.
 * 
 * For client-side head detection, you would need:
 * - TensorFlow.js with face detection models (large bundle size)
 * - MediaPipe Face Detection (complex setup)
 * - Or manual cropping by user
 */
export async function extractPetHead(
  imageFile: File,
  productId?: string // Product ID to pass to Lambda - Lambda handles all prompts internally based on product type
): Promise<{ blob: Blob; dataUrl: string; bounds: { x: number; y: number; width: number; height: number } | Array<{ x: number; y: number }>; polygonOutline?: Array<{ x: number; y: number }>; s3Url?: string }> {
  // Client-side head detection is complex and requires ML models
  // For now, we use Lambda backend which is more reliable
  
  const base64 = await fileToBase64(imageFile);

  // Lambda function: petHeadDetection-prod
  const lambdaEndpoint = 'https://ndwhcwrkqtlxkbgw7bnzr2cyce0drxzt.lambda-url.ap-southeast-1.on.aws/';

  // Add timeout for Lambda call (450 seconds) - backend needs more time for AI processing
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 450000); // 450 second timeout

  // Convert product ID to product type string for Lambda
  // NOTE: Lambda handles all prompts internally - frontend only passes product type
  // Lambda uses product type to determine which prompts to use (e.g., red-pocket gets white border)
  // Product types: 'red-pocket' (for red pocket products) or 'default' (for fai chun and other products)
  let productType: string = 'default'; // Default to 'default' for fai chun and other products
  if (productId === 'red-pocket') {
    productType = 'red-pocket'; // Pass 'red-pocket' directly to Lambda
  }

  // Log what we're sending to Lambda for debugging
  console.log('🚀 Calling Lambda for pet head detection:', {
    productId,
    productType: productType || 'none',
    imageSize: base64.length,
    imageType: imageFile.type,
    note: 'Lambda will handle all prompts internally based on product type'
  });

  try {
    const requestBody = {
      image: base64,
      type: imageFile.type,
      action: 'detect-head-remove-bg', // Request background removal
      removeBackground: true, // Also include flag for background removal
      method: 'gemini', // Use Gemini AI for better detection and cropping
      product: productType, // Pass product type to Lambda - Lambda handles all prompts internally
    };
    
    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle specific error cases
      if (response.status === 502 || response.status === 504) {
        throw new Error('AI 處理超時或記憶體不足，請嘗試上傳較小的圖片或稍後再試');
      } else if (response.status === 500) {
        throw new Error('AI 服務暫時無法使用，請稍後再試');
      } else {
        throw new Error(`Head extraction failed: ${response.statusText} - ${errorText}`);
      }
    }

    const result = await response.json();
    
    // Extract filename from processedImageUrl to check if it includes '-with-border'
    const processedImageUrl = result.croppedHeadUrl || result.processedImageUrl;
    const filename = processedImageUrl ? processedImageUrl.split('/').pop() : null;
    const hasWithBorder = filename?.includes('-with-border') || false;
    
    console.log('✅ Lambda response received (using Gemini AI):', { 
      method: result.method || 'rekognition', // Detection method used (gemini or rekognition)
      productType: productType || 'none',
      hasCroppedHeadUrl: !!result.croppedHeadUrl,
      hasProcessedImageUrl: !!result.processedImageUrl,
      hasImageUrl: !!result.imageUrl, 
      hasBounds: !!result.bounds,
      hasPolygonOutline: !!result.polygonOutline,
      bounds: result.bounds,
      polygonOutline: result.polygonOutline ? `${result.polygonOutline.length} points` : null,
      imageUrl: result.imageUrl,
      processedImageUrl: processedImageUrl,
      filename: filename,
      hasWithBorderInFilename: hasWithBorder, // Check if filename includes '-with-border' (indicates white border was added)
      confidence: result.confidence,
      allKeys: Object.keys(result),
      fullResult: result,
      note: 'Check CloudWatch logs for Lambda-side logging (product detection, Gemini calls, etc.)'
    });
    
    if (productType === 'red-pocket' && !hasWithBorder) {
      console.warn('⚠️ Red-pocket product detected but filename does NOT include "-with-border"');
      console.warn('   This suggests the white border may not have been added. Check Lambda CloudWatch logs.');
    } else if (productType === 'red-pocket' && hasWithBorder) {
      console.log('✅ Red-pocket product - filename includes "-with-border" (white border should be present)');
    }
  
    // NEW: Lambda now crops and removes background, returning the final processed image
    // Priority: croppedHeadUrl/processedImageUrl (already processed) > imageUrl + bounds (needs frontend cropping)
    // Note: processedImageUrl is already declared above (line 225) from the filename check
    let blob: Blob;
    let dataUrl: string;
    let s3Url: string | undefined;
    let adjustedPolygonOutline: Array<{ x: number; y: number }> | undefined = undefined;

    // Check if Lambda already processed the image (cropped + background removed)
    // Gemini returns processedImageUrl directly (already cropped with transparent background)
    // Rekognition may also return processedImageUrl if remove.bg was used
    // processedImageUrl is already declared above (no need to redeclare)
    
    if (processedImageUrl) {
    // Lambda has already cropped and removed background - use it directly
    // This is the primary path for Gemini (which always returns processedImageUrl)
    const method = result.method || 'unknown';
    console.log(`Using pre-processed image from Lambda (${method} method - already cropped and background removed):`, processedImageUrl);
    s3Url = processedImageUrl;
    const imageResponse = await fetch(processedImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch processed image from S3: ${imageResponse.statusText}`);
    }
    blob = await imageResponse.blob();
    dataUrl = await blobToDataUrl(blob);
    console.log('Pre-processed image loaded, size:', blob.size);
      // No polygon outline needed - image is already cropped with transparent background
      adjustedPolygonOutline = undefined;
    } else if (result.imageUrl) {
    // Legacy format: Lambda returns original image + bounds for frontend cropping
    // Check for polygonOutline first (preferred format from Lambda)
    const hasPolygonOutline = Array.isArray(result.polygonOutline) && result.polygonOutline.length >= 3 &&
                               result.polygonOutline.every((p: any) => typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number');
    
    // Check if bounds is a polygon (array of points) - legacy format
    const isPolygonBounds = Array.isArray(result.bounds) && result.bounds.length >= 3 && 
                            result.bounds.every((p: any) => typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number');
    
    // Check if bounds is a rectangle
    const isRectangle = result.bounds && 
                        typeof result.bounds.x === 'number' && 
                        typeof result.bounds.y === 'number' && 
                        typeof result.bounds.width === 'number' && 
                        typeof result.bounds.height === 'number';

      if (hasPolygonOutline || isPolygonBounds || isRectangle) {
        // New format: S3 URL to original image + polygon/rectangle for cropping
        s3Url = result.imageUrl;
        
        console.log('Fetching original image from S3:', result.imageUrl);
        // Fetch original image from S3
        const imageResponse = await fetch(result.imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image from S3: ${imageResponse.statusText}`);
        }
        
        const originalBlob = await imageResponse.blob();
        console.log('Original image fetched, size:', originalBlob.size);
        
        // Crop the image on the frontend using Canvas API
        // Priority: polygonOutline > polygon bounds > rectangle bounds
        if (hasPolygonOutline) {
          console.log('Cropping image with polygonOutline:', result.polygonOutline.length, 'points');
      const polygon = result.polygonOutline as Array<{ x: number; y: number }>;
      const croppedBlob = await cropImageFromPolygon(originalBlob, polygon);
      blob = croppedBlob;
      dataUrl = await blobToDataUrl(blob);
      
      // Calculate adjusted polygon coordinates relative to cropped image
      // The polygon coordinates are relative to the original image
      // After cropping, we need to adjust them relative to the cropped image
      const xs = polygon.map(p => p.x);
      const ys = polygon.map(p => p.y);
      const minX = Math.max(0, Math.min(...xs));
      const minY = Math.max(0, Math.min(...ys));
      
      // Adjust coordinates relative to cropped image (subtract bounding box offset)
      adjustedPolygonOutline = polygon.map(point => ({
        x: point.x - minX,
        y: point.y - minY
      }));
      
      console.log('Image cropped successfully with polygonOutline, size:', croppedBlob.size);
      console.log('Adjusted polygon outline for cropped image:', adjustedPolygonOutline.length, 'points');
    } else if (isPolygonBounds) {
      console.log('Cropping image with polygon bounds:', result.bounds);
      const polygon = result.bounds as Array<{ x: number; y: number }>;
      const croppedBlob = await cropImageFromPolygon(originalBlob, polygon);
      blob = croppedBlob;
      dataUrl = await blobToDataUrl(blob);
      
      // Calculate adjusted polygon coordinates
      const xs = polygon.map(p => p.x);
      const ys = polygon.map(p => p.y);
      const minX = Math.max(0, Math.min(...xs));
      const minY = Math.max(0, Math.min(...ys));
      
      adjustedPolygonOutline = polygon.map(point => ({
        x: point.x - minX,
        y: point.y - minY
      }));
      
      console.log('Image cropped successfully with polygon bounds, size:', croppedBlob.size);
      console.log('Adjusted polygon outline for cropped image:', adjustedPolygonOutline.length, 'points');
    } else {
      console.log('Cropping image with rectangle bounds (fallback):', result.bounds);
      const croppedBlob = await cropImageFromBounds(originalBlob, result.bounds as { x: number; y: number; width: number; height: number });
      blob = croppedBlob;
      dataUrl = await blobToDataUrl(blob);
          console.log('Image cropped successfully with rectangle, size:', croppedBlob.size);
          // No polygon for rectangle bounds
          adjustedPolygonOutline = undefined;
        }
        s3Url = result.imageUrl; // Keep original URL for reference
      }
    } else if (result.image) {
      // Old format: base64 (for backward compatibility)
      blob = base64ToBlob(result.image, 'image/png');
      dataUrl = await blobToDataUrl(blob);
      adjustedPolygonOutline = undefined; // No polygon for old format
    } else {
      // Log detailed error for debugging
      console.error('Invalid Lambda response format:', {
        hasImageUrl: !!result.imageUrl,
        hasBounds: !!result.bounds,
        hasPolygonOutline: !!result.polygonOutline,
        boundsType: typeof result.bounds,
        boundsValue: result.bounds,
        polygonOutlineType: Array.isArray(result.polygonOutline) ? 'array' : typeof result.polygonOutline,
        polygonOutlineLength: Array.isArray(result.polygonOutline) ? result.polygonOutline.length : null,
        hasCroppedHeadUrl: !!result.croppedHeadUrl,
        hasImage: !!result.image,
        fullResponse: result
      });
      throw new Error(`Invalid response format from Lambda. Expected imageUrl with polygonOutline/bounds, croppedHeadUrl, or image. Got: ${JSON.stringify(Object.keys(result))}`);
    }

    // Determine final bounds for return value
    // If we have a processed image from Lambda, bounds are not needed (image already cropped)
    // Otherwise, use adjusted polygon outline or rectangle bounds
    const finalBounds = adjustedPolygonOutline 
      ? adjustedPolygonOutline 
      : (result.bounds || { x: 0, y: 0, width: 0, height: 0 });

    return {
      blob,
      dataUrl,
      bounds: finalBounds, // Can be polygon array [{x, y}, ...] or rectangle { x, y, width, height }
      polygonOutline: adjustedPolygonOutline, // Adjusted polygon coordinates relative to cropped image (for clip-path)
      s3Url, // Include S3 URL for reference
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('AI 處理超時（超過450秒），請嘗試上傳較小的圖片或稍後再試');
    }
    
    // Re-throw if it's already a formatted error
    if (error.message && (error.message.includes('AI') || error.message.includes('處理'))) {
      throw error;
    }
    
    // Handle network errors
    if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
      throw new Error('網路連線錯誤，請檢查您的網路連線後再試');
    }
    
    throw error;
  }
}

/**
 * Client-side head detection using TensorFlow.js (optional, not implemented)
 * This would require installing @tensorflow/tfjs and face detection models
 * Bundle size: ~5-10MB additional
 */
async function detectHeadClientSide(imageFile: File): Promise<{ x: number; y: number; width: number; height: number } | null> {
  // This is a placeholder - would require:
  // 1. npm install @tensorflow/tfjs @tensorflow-models/blazeface
  // 2. Load model (~5MB)
  // 3. Run inference
  // 4. Extract bounding box
  
  // Example structure (not functional):
  /*
  try {
    const tf = await import('@tensorflow/tfjs');
    const blazeface = await import('@tensorflow-models/blazeface');
    
    await tf.ready();
    const model = await blazeface.load();
    
    const img = await createImageBitmap(imageFile);
    const predictions = await model.estimateFaces(img, false);
    
    if (predictions.length > 0) {
      const face = predictions[0];
      // Convert to crop bounds
      return {
        x: face.topLeft[0],
        y: face.topLeft[1],
        width: face.bottomRight[0] - face.topLeft[0],
        height: face.bottomRight[1] - face.topLeft[1],
      };
    }
  } catch (error) {
    console.error('Client-side head detection failed:', error);
  }
  */
  
  return null;
}

// Helper functions
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Return the full data URL (includes data:image/...;base64, prefix)
      resolve(reader.result as string);
    };
    reader.onerror = reject;
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return blobToDataUrl(file);
}

/**
 * Crop image using Canvas API based on polygon coordinates
 * Uses mask-based approach similar to FreeFormCrop
 */
async function cropImageFromPolygon(
  imageBlob: Blob,
  polygon: Array<{ x: number; y: number }>
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const objectUrl = URL.createObjectURL(imageBlob);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        // Validate polygon - accepts any number of points (minimum 3)
        if (!polygon || polygon.length < 3) {
          reject(new Error(`Invalid polygon: must have at least 3 points, got ${polygon?.length || 0}`));
          return;
        }
        
        console.log(`Processing polygon with ${polygon.length} points (dynamic, not fixed)`);

        // Validate all points
        for (const point of polygon) {
          if (typeof point.x !== 'number' || typeof point.y !== 'number') {
            reject(new Error(`Invalid polygon point: ${JSON.stringify(point)}`));
            return;
          }
        }

        // Calculate bounding box
        const xs = polygon.map(p => p.x);
        const ys = polygon.map(p => p.y);
        const minX = Math.max(0, Math.min(...xs));
        const minY = Math.max(0, Math.min(...ys));
        const maxX = Math.min(img.naturalWidth, Math.max(...xs));
        const maxY = Math.min(img.naturalHeight, Math.max(...ys));
        const width = maxX - minX;
        const height = maxY - minY;

        if (width <= 0 || height <= 0) {
          reject(new Error(`Invalid bounding box: width=${width}, height=${height}`));
          return;
        }

        // Create canvas for the cropped region
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width);
        canvas.height = Math.ceil(height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw the image portion first (from bounding box)
        ctx.drawImage(
          img,
          minX, minY, width, height, // Source rectangle
          0, 0, canvas.width, canvas.height // Destination rectangle
        );

        // Create mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');

        if (!maskCtx) {
          reject(new Error('Failed to create mask canvas'));
          return;
        }

        // Create mask: black background with white polygon shape
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Draw white polygon shape (adjusted relative to bounding box)
        maskCtx.fillStyle = 'white';
        maskCtx.beginPath();
        polygon.forEach((point, index) => {
          const x = point.x - minX;
          const y = point.y - minY;
          if (index === 0) {
            maskCtx.moveTo(x, y);
          } else {
            maskCtx.lineTo(x, y);
          }
        });
        maskCtx.closePath();
        maskCtx.fill();

        // Apply mask using destination-in composite operation
        // This will make everything outside the polygon transparent
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over'; // Reset to default

        // Verify transparency was applied by checking alpha channel
        const sampleData = ctx.getImageData(
          Math.floor(canvas.width / 2),
          Math.floor(canvas.height / 2),
          1,
          1
        );
        console.log('Polygon crop transparency check:', {
          centerAlpha: sampleData.data[3],
          hasTransparency: sampleData.data[3] < 255
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Polygon crop successful, size:', blob.size);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      console.error('Error loading image for polygon cropping:', e);
      reject(new Error('Failed to load image for polygon cropping'));
    };

    img.src = objectUrl;
  });
}

/**
 * Crop image using Canvas API based on rectangular bounds
 * This replaces Sharp on the backend - we do cropping on the frontend
 */
async function cropImageFromBounds(
  imageBlob: Blob,
  bounds: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for CORS when loading from S3
    
    const objectUrl = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      try {
        // Validate bounds
        if (!bounds || typeof bounds.x !== 'number' || typeof bounds.y !== 'number' || 
            typeof bounds.width !== 'number' || typeof bounds.height !== 'number') {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Invalid bounds format: ${JSON.stringify(bounds)}`));
          return;
        }
        
        if (bounds.width <= 0 || bounds.height <= 0) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Invalid bounds dimensions: width=${bounds.width}, height=${bounds.height}`));
          return;
        }
        
        if (bounds.x < 0 || bounds.y < 0) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Invalid bounds position: x=${bounds.x}, y=${bounds.y}`));
          return;
        }
        
        // Ensure bounds don't exceed image dimensions
        const maxX = Math.min(bounds.x + bounds.width, img.naturalWidth);
        const maxY = Math.min(bounds.y + bounds.height, img.naturalHeight);
        const actualX = Math.max(0, bounds.x);
        const actualY = Math.max(0, bounds.y);
        const actualWidth = maxX - actualX;
        const actualHeight = maxY - actualY;
        
        if (actualWidth <= 0 || actualHeight <= 0) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Bounds outside image: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}, imgSize=${img.naturalWidth}x${img.naturalHeight}`));
          return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw the cropped portion
        ctx.drawImage(
          img,
          actualX, actualY, actualWidth, actualHeight, // Source rectangle
          0, 0, actualWidth, actualHeight // Destination rectangle
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            console.log('Canvas to blob successful, size:', blob.size);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      console.error('Image load error:', error);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = objectUrl;
  });
}

