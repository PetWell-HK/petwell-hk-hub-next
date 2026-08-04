import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { X, RotateCcw, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface FreeFormCropProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File;
  onCrop: (croppedBlob: Blob, dataUrl: string) => void;
}

export const FreeFormCrop = ({
  open,
  onOpenChange,
  imageFile,
  onCrop,
}: FreeFormCropProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!open || !imageFile) return;

    const img = new Image();
    img.onload = () => {
      console.log('Image loaded in crop dialog:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: img.width,
        height: img.height,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });
      imageRef.current = img;
      setImageLoaded(true);
      setPoints([]);
      setScale(1);
      setPanOffset({ x: 0, y: 0 });
      drawCanvas();
    };
    img.onerror = (error) => {
      console.error('Error loading image in crop dialog:', error);
    };
    img.src = URL.createObjectURL(imageFile);

    return () => {
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
    };
  }, [open, imageFile]);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container size
    const containerRect = container.getBoundingClientRect();
    const maxWidth = Math.min(containerRect.width - 32, 1000); // Leave some padding
    const maxHeight = Math.min(containerRect.height - 200, 700); // Leave space for controls

    // Set canvas size to fit container, maintaining image aspect ratio
    const imgAspect = img.width / img.height;
    const containerAspect = maxWidth / maxHeight;
    
    let canvasWidth: number;
    let canvasHeight: number;

    if (imgAspect > containerAspect) {
      // Image is wider - fit to width
      canvasWidth = maxWidth;
      canvasHeight = maxWidth / imgAspect;
    } else {
      // Image is taller - fit to height
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * imgAspect;
    }

    // Ensure minimum size
    canvasWidth = Math.max(canvasWidth, 400);
    canvasHeight = Math.max(canvasHeight, 300);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate scale to fit image in canvas
    const scaleToFit = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const displayWidth = img.width * scaleToFit;
    const displayHeight = img.height * scaleToFit;
    const displayX = (canvasWidth - displayWidth) / 2;
    const displayY = (canvasHeight - displayHeight) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply pan and zoom
    ctx.save();
    ctx.translate(displayX + displayWidth / 2 + panOffset.x, displayY + displayHeight / 2 + panOffset.y);
    ctx.scale(scale * scaleToFit, scale * scaleToFit);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();

      // Draw crop path
      if (points.length > 0) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Calculate display dimensions
        const scaleToFit = Math.min(canvas.width / img.width, canvas.height / img.height);
        const displayWidth = img.width * scaleToFit;
        const displayHeight = img.height * scaleToFit;
        const displayX = (canvas.width - displayWidth) / 2;
        const displayY = (canvas.height - displayHeight) / 2;

        ctx.beginPath();
        points.forEach((point, index) => {
          // Convert image coordinates to canvas coordinates
          const relativeX = (point.x - img.width / 2) * scale * scaleToFit;
          const relativeY = (point.y - img.height / 2) * scale * scaleToFit;
          const x = displayX + displayWidth / 2 + panOffset.x + relativeX;
          const y = displayY + displayHeight / 2 + panOffset.y + relativeY;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        if (points.length > 2) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();

        // Draw points
        points.forEach((point) => {
          const relativeX = (point.x - img.width / 2) * scale * scaleToFit;
          const relativeY = (point.y - img.height / 2) * scale * scaleToFit;
          const x = displayX + displayWidth / 2 + panOffset.x + relativeX;
          const y = displayY + displayHeight / 2 + panOffset.y + relativeY;
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }
  }, [points, scale, panOffset, imageLoaded]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, drawCanvas]);

  // Recalculate canvas size when container resizes
  useEffect(() => {
    if (!open || !imageLoaded) return;

    const handleResize = () => {
      drawCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, imageLoaded, drawCanvas]);

  // Convert canvas coordinates to image coordinates
  const canvasToImage = (canvasX: number, canvasY: number) => {
    const img = imageRef.current;
    if (!img) return { x: 0, y: 0 };

    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Calculate display dimensions
    const scaleToFit = Math.min(canvas.width / img.width, canvas.height / img.height);
    const displayWidth = img.width * scaleToFit;
    const displayHeight = img.height * scaleToFit;
    const displayX = (canvas.width - displayWidth) / 2;
    const displayY = (canvas.height - displayHeight) / 2;

    // Convert canvas coordinates to image coordinates
    // Account for: display offset, pan offset, and scale
    const relativeX = canvasX - displayX - displayWidth / 2 - panOffset.x;
    const relativeY = canvasY - displayY - displayHeight / 2 - panOffset.y;
    const imgX = (relativeX / (scale * scaleToFit)) + img.width / 2;
    const imgY = (relativeY / (scale * scaleToFit)) + img.height / 2;

    const result = { 
      x: Math.max(0, Math.min(imgX, img.width)), 
      y: Math.max(0, Math.min(imgY, img.height)) 
    };
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Canvas to image conversion:', {
        canvas: { x: canvasX, y: canvasY },
        image: result,
        scale,
        scaleToFit,
        panOffset,
      });
    }
    
    return result;
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near existing point (for closing path)
    const threshold = 10;
    if (points.length > 2) {
      const firstPoint = points[0];
      const firstX = firstPoint.x * scale + panOffset.x;
      const firstY = firstPoint.y * scale + panOffset.y;
      const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
      if (dist < threshold) {
        // Close the path
        setIsDrawing(false);
        return;
      }
    }

    // Check if right-clicking or middle-clicking (for panning)
    if (e.button === 1 || e.button === 2 || e.ctrlKey || e.metaKey) {
      setIsPanning(true);
      setPanStart({ x: x - panOffset.x, y: y - panOffset.y });
      return;
    }

    // Add point
    const imgPoint = canvasToImage(x, y);
    setPoints((prev) => [...prev, imgPoint]);
    setIsDrawing(true);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning) {
      setPanOffset({
        x: x - panStart.x,
        y: y - panStart.y,
      });
    } else if (isDrawing && points.length > 0) {
      // Update last point while drawing
      const imgPoint = canvasToImage(x, y);
      setPoints((prev) => {
        const newPoints = [...prev];
        newPoints[newPoints.length - 1] = imgPoint;
        return newPoints;
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  // Handle wheel for zoom (now handled by useEffect with passive: false)

  // Reset crop
  const handleReset = () => {
    setPoints([]);
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Apply crop
  const handleApply = async () => {
    if (points.length < 3) {
      console.error('Need at least 3 points to crop');
      return;
    }

    const img = imageRef.current;
    if (!img || !img.complete) {
      console.error('Image not loaded');
      return;
    }

    console.log('Starting crop with points:', points);
    console.log('Image dimensions:', img.width, img.height);

    // Get bounding box
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.max(0, Math.min(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxX = Math.min(img.width, Math.max(...xs));
    const maxY = Math.min(img.height, Math.max(...ys));
    const width = maxX - minX;
    const height = maxY - minY;

    console.log('Bounding box:', { minX, minY, maxX, maxY, width, height });

    // Validate dimensions
    if (width <= 0 || height <= 0) {
      console.error('Invalid bounding box dimensions:', { width, height });
      return;
    }

    // Use actual crop dimensions (don't force minimum size as it distorts the image)
    // Only ensure minimum of 1px to avoid invalid dimensions
    const finalWidth = Math.max(Math.ceil(width), 1);
    const finalHeight = Math.max(Math.ceil(height), 1);
    const scaleX = 1; // No scaling - use original dimensions
    const scaleY = 1;

    // Create final canvas with just the cropped region
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!finalCtx) {
      console.error('Failed to get canvas context');
      return;
    }

    // Fill with transparent background first
    finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw the image portion first, scaled if needed
    finalCtx.drawImage(
      img,
      minX,
      minY,
      width,
      height,
      0,
      0,
      finalWidth,
      finalHeight
    );
    
    console.log('Image drawn, checking before mask...', {
      source: { minX, minY, width, height },
      dest: { width: finalWidth, height: finalHeight },
      scale: { scaleX, scaleY }
    });
    
    // Verify we have content before masking
    const beforeMaskCheck = finalCtx.getImageData(
      Math.floor(finalCanvas.width / 2),
      Math.floor(finalCanvas.height / 2),
      1,
      1
    );
    console.log('Before mask check:', { 
      alpha: beforeMaskCheck.data[3],
      rgb: [beforeMaskCheck.data[0], beforeMaskCheck.data[1], beforeMaskCheck.data[2]]
    });
    
    // Now apply clipping to mask out areas outside the polygon
    // We need to use composite operation to create a mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = finalCanvas.width;
    maskCanvas.height = finalCanvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) {
      console.error('Failed to create mask canvas');
      return;
    }
    
    // Draw white shape on black background for mask
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = 'white';
    maskCtx.beginPath();
    points.forEach((point, index) => {
      // Points relative to bounding box
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
    
    // Debug: Check mask coverage
    const maskSample = maskCtx.getImageData(
      Math.floor(maskCanvas.width / 2),
      Math.floor(maskCanvas.height / 2),
      1,
      1
    );
    console.log('Mask sample at center:', {
      r: maskSample.data[0],
      g: maskSample.data[1],
      b: maskSample.data[2],
      a: maskSample.data[3],
      isWhite: maskSample.data[0] === 255 && maskSample.data[1] === 255 && maskSample.data[2] === 255
    });
    
    // Apply mask using destination-in composite
    // This keeps only pixels where mask is white (non-transparent)
    finalCtx.save();
    finalCtx.globalCompositeOperation = 'destination-in';
    finalCtx.drawImage(maskCanvas, 0, 0);
    finalCtx.restore(); // Restore composite operation
    
    console.log('Image drawn and masked');
    
    // Verify after masking
    const afterMaskCheck = finalCtx.getImageData(
      Math.floor(finalCanvas.width / 2),
      Math.floor(finalCanvas.height / 2),
      1,
      1
    );
    console.log('After mask check:', { 
      alpha: afterMaskCheck.data[3],
      rgb: [afterMaskCheck.data[0], afterMaskCheck.data[1], afterMaskCheck.data[2]]
    });

    // Verify the canvas has content before converting
    // Check multiple points to ensure we have content
    let hasContent = false;
    const checkPoints = [
      { x: Math.floor(finalCanvas.width / 2), y: Math.floor(finalCanvas.height / 2) },
      { x: Math.floor(finalCanvas.width / 4), y: Math.floor(finalCanvas.height / 4) },
      { x: Math.floor(finalCanvas.width * 3 / 4), y: Math.floor(finalCanvas.height * 3 / 4) },
    ];
    
    for (const point of checkPoints) {
      if (point.x >= 0 && point.x < finalCanvas.width && point.y >= 0 && point.y < finalCanvas.height) {
        const imageData = finalCtx.getImageData(point.x, point.y, 1, 1);
        const alpha = imageData.data[3]; // Alpha channel
        if (alpha > 0) {
          hasContent = true;
          break;
        }
      }
    }
    
    console.log('Canvas content check:', { hasContent, canvasSize: { width: finalCanvas.width, height: finalCanvas.height } });

    if (!hasContent) {
      console.warn('Cropped image appears empty after masking, trying fallback without mask');
      // Fallback: Draw without mask (just the bounding box region)
      finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
      finalCtx.drawImage(
        img,
        minX,
        minY,
        width,
        height,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height
      );
      
      // Check again
      const fallbackCheck = finalCtx.getImageData(
        Math.floor(finalCanvas.width / 2),
        Math.floor(finalCanvas.height / 2),
        1,
        1
      );
      hasContent = fallbackCheck.data[3] > 0;
      console.log('Fallback (no mask) content check:', { 
        hasContent,
        alpha: fallbackCheck.data[3],
        rgb: [fallbackCheck.data[0], fallbackCheck.data[1], fallbackCheck.data[2]]
      });
    }

    if (!hasContent) {
      console.error('Failed to create cropped image - canvas is completely empty');
      alert('裁剪失敗：無法創建圖片。請確保裁剪區域包含圖片內容。');
      return;
    }
    
    // Final verification - log canvas stats
    const fullImageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
    let pixelCount = 0;
    for (let i = 3; i < fullImageData.data.length; i += 4) {
      if (fullImageData.data[i] > 0) pixelCount++;
    }
    console.log('Final canvas stats:', {
      totalPixels: finalCanvas.width * finalCanvas.height,
      nonTransparentPixels: pixelCount,
      percentage: ((pixelCount / (finalCanvas.width * finalCanvas.height)) * 100).toFixed(2) + '%'
    });

    // Final verification - check multiple points across the canvas
    const samplePoints = [
      { x: Math.floor(finalCanvas.width * 0.25), y: Math.floor(finalCanvas.height * 0.25) },
      { x: Math.floor(finalCanvas.width * 0.5), y: Math.floor(finalCanvas.height * 0.5) },
      { x: Math.floor(finalCanvas.width * 0.75), y: Math.floor(finalCanvas.height * 0.75) },
    ];
    
    const sampleData = samplePoints.map(point => {
      const data = finalCtx.getImageData(point.x, point.y, 1, 1);
      return {
        point,
        alpha: data.data[3],
        rgb: [data.data[0], data.data[1], data.data[2]]
      };
    });
    
    console.log('Final canvas sample points:', sampleData);
    
    // Count non-transparent pixels
    const sampleArea = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
    let nonTransparentPixels = 0;
    for (let i = 3; i < sampleArea.data.length; i += 4) {
      if (sampleArea.data[i] > 0) {
        nonTransparentPixels++;
      }
    }
    console.log('Non-transparent pixels:', nonTransparentPixels, 'out of', finalCanvas.width * finalCanvas.height);

    // Convert to blob
    finalCanvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }

      console.log('Blob created:', { size: blob.size, type: blob.type });

      // Create a test image to verify the blob
      const testImg = new Image();
      testImg.onload = () => {
        console.log('Test image loaded from blob:', {
          width: testImg.width,
          height: testImg.height,
          naturalWidth: testImg.naturalWidth,
          naturalHeight: testImg.naturalHeight
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          console.log('Data URL created, length:', dataUrl.length);
          
          // Verify data URL is valid
          const testImg2 = new Image();
          testImg2.onload = () => {
            console.log('Test image loaded from data URL:', {
              width: testImg2.width,
              height: testImg2.height
            });
            onCrop(blob, dataUrl);
            onOpenChange(false);
          };
          testImg2.onerror = (error) => {
            console.error('Data URL is invalid:', error);
          };
          testImg2.src = dataUrl;
        };
        reader.onerror = (error) => {
          console.error('Error reading blob:', error);
        };
        reader.readAsDataURL(blob);
      };
      testImg.onerror = (error) => {
        console.error('Blob is invalid image:', error);
      };
      testImg.src = URL.createObjectURL(blob);
    }, 'image/png', 1.0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>自由裁剪寵物頭部</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1 bg-muted p-3 rounded-lg">
            <p>• <strong>左鍵點擊</strong>：添加裁剪點，圍繞寵物頭部繪製形狀</p>
            <p>• <strong>滾輪</strong>：縮放圖片</p>
            <p>• <strong>Ctrl/Command + 拖動</strong>：平移圖片</p>
            <p>• <strong>至少需要3個點</strong>才能完成裁剪</p>
          </div>

          {/* Canvas */}
          <div 
            ref={containerRef}
            className="border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center"
            style={{ minHeight: '500px', maxHeight: '70vh' }}
          >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale((s) => Math.min(3, s + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重置
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              已添加 {points.length} 個點
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleApply}
            disabled={points.length < 3}
          >
            <Check className="w-4 h-4 mr-1" />
            確認裁剪
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

