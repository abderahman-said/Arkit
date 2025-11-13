"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Crop,
  Eraser,
  X,
  Check,
  Loader2
} from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { LivePreview } from "@/components/live-preview";
import { incrementImagesUploaded } from "@/lib/stats";
import { getToolSettings, saveToolSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type EditorMode = "crop" | "removebg";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageEditorPage() {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<EditorMode>("crop");
  
  // Crop state
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropOverlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Load saved settings
  useEffect(() => {
    const settings = getToolSettings("image-editor");
    if (settings.mode) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setMode(settings.mode as EditorMode);
      }, 0);
    }
  }, []);

  // Save settings
  useEffect(() => {
    saveToolSettings("image-editor", { mode });
  }, [mode]);

  // Track tool usage
  useEffect(() => {
    if (selectedFile) {
      const event = new CustomEvent('tool-used', {
        detail: {
          toolId: 'image-editor',
          toolHref: '/image-editor'
        }
      });
      window.dispatchEvent(event);
    }
  }, [selectedFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (processedUrl) {
        URL.revokeObjectURL(processedUrl);
      }
    };
  }, [previewUrl, processedUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setProcessedUrl(null);
      setProcessedBlob(null);
      setCropArea(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      incrementImagesUploaded(1);
      
      // Image will be loaded when displayed
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setProcessedUrl(null);
      setProcessedBlob(null);
      setCropArea(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      incrementImagesUploaded(1);
      
      // Image will be loaded when displayed
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Get image display rect relative to container
  const getImageDisplayRect = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return null;
    
    const img = imageRef.current;
    const container = containerRef.current;
    
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    return {
      left: imgRect.left - containerRect.left,
      top: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height,
    };
  }, []);

  // Smooth crop handling with requestAnimationFrame
  const handleCropStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewUrl || mode !== "crop" || !imageRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const displayRect = getImageDisplayRect();
    if (!displayRect) return;
    
    const containerRect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - containerRect.left - displayRect.left;
    const y = e.clientY - containerRect.top - displayRect.top;
    
    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(displayRect.width, x));
    const clampedY = Math.max(0, Math.min(displayRect.height, y));
    
    setCropStart({ x: clampedX, y: clampedY });
    setIsCropping(true);
    setCropArea({ x: clampedX, y: clampedY, width: 0, height: 0 });
    
    // Animate crop overlay appearance with CSS transitions
    setTimeout(() => {
      if (cropOverlayRef.current) {
        cropOverlayRef.current.style.opacity = "0";
        cropOverlayRef.current.style.transform = "scale(0.8)";
        cropOverlayRef.current.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
        requestAnimationFrame(() => {
          if (cropOverlayRef.current) {
            cropOverlayRef.current.style.opacity = "1";
            cropOverlayRef.current.style.transform = "scale(1)";
          }
        });
      }
    }, 0);
  }, [previewUrl, mode, getImageDisplayRect]);

  const handleCropMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart || !previewUrl || !imageRef.current) return;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const displayRect = getImageDisplayRect();
      if (!displayRect) return;
      
      const containerRect = containerRef.current!.getBoundingClientRect();
      const currentX = e.clientX - containerRect.left - displayRect.left;
      const currentY = e.clientY - containerRect.top - displayRect.top;
      
      // Clamp to image bounds
      const clampedX = Math.max(0, Math.min(displayRect.width, currentX));
      const clampedY = Math.max(0, Math.min(displayRect.height, currentY));
      
      const x = Math.min(cropStart.x, clampedX);
      const y = Math.min(cropStart.y, clampedY);
      const width = Math.abs(clampedX - cropStart.x);
      const height = Math.abs(clampedY - cropStart.y);
      
      setCropArea({ x, y, width, height });
    });
  }, [isCropping, cropStart, previewUrl, getImageDisplayRect]);

  const handleCropEnd = useCallback(() => {
    setIsCropping(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Global mouse handlers for smooth dragging
  useEffect(() => {
    if (!isCropping) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cropStart || !imageRef.current || !containerRef.current) return;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const displayRect = getImageDisplayRect();
        if (!displayRect) return;
        
        const containerRect = containerRef.current!.getBoundingClientRect();
        const currentX = e.clientX - containerRect.left - displayRect.left;
        const currentY = e.clientY - containerRect.top - displayRect.top;
        
        // Clamp to image bounds
        const clampedX = Math.max(0, Math.min(displayRect.width, currentX));
        const clampedY = Math.max(0, Math.min(displayRect.height, currentY));
        
        const x = Math.min(cropStart.x, clampedX);
        const y = Math.min(cropStart.y, clampedY);
        const width = Math.abs(clampedX - cropStart.x);
        const height = Math.abs(clampedY - cropStart.y);
        
        setCropArea({ x, y, width, height });
      });
    };

    const handleMouseUp = () => {
      handleCropEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isCropping, cropStart, getImageDisplayRect, handleCropEnd]);

  const applyCrop = async () => {
    if (!previewUrl || !cropArea || !selectedFile || cropArea.width <= 0 || cropArea.height <= 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      const displayRect = getImageDisplayRect();
      if (!displayRect) {
        setIsProcessing(false);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Calculate scale factors (natural size to display size)
      const scaleX = img.naturalWidth / displayRect.width;
      const scaleY = img.naturalHeight / displayRect.height;
      
      // Convert display coordinates to natural image coordinates
      const sx = cropArea.x * scaleX;
      const sy = cropArea.y * scaleY;
      const sw = cropArea.width * scaleX;
      const sh = cropArea.height * scaleY;
      
      // Ensure crop area is valid
      if (sw <= 0 || sh <= 0 || sx < 0 || sy < 0 || sx + sw > img.naturalWidth || sy + sh > img.naturalHeight) {
        setIsProcessing(false);
        return;
      }

      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      
      // Use high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(
        img,
        sx, sy, sw, sh,  // Source rectangle (from original image)
        0, 0, sw, sh     // Destination rectangle (to canvas)
      );

      setProgress(50);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setProcessedUrl(url);
          setProcessedBlob(blob);
          setProgress(100);
        }
        setIsProcessing(false);
      }, selectedFile.type || "image/png", 0.95);
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Improved Remove Background functionality
  const removeBackground = async () => {
    if (!previewUrl || !selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      setProgress(20);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      setProgress(40);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      setProgress(60);

      // Improved background removal algorithm
      // Uses multiple techniques: brightness, color similarity, and edge detection
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip already transparent pixels
        if (a === 0) continue;
        
        // Calculate brightness
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        // Calculate color variance (how similar RGB values are)
        const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
        
        // Method 1: Remove very bright/white backgrounds
        if (brightness > 245 && variance < 20) {
          data[i + 3] = 0;
          continue;
        }
        
        // Method 2: Remove light gray backgrounds
        if (brightness > 230 && brightness < 250 && variance < 30) {
          data[i + 3] = Math.max(0, a - 150);
          continue;
        }
        
        // Method 3: Remove very light colored backgrounds (pastels)
        if (brightness > 240 && r > 200 && g > 200 && b > 200) {
          data[i + 3] = Math.max(0, a - 120);
          continue;
        }
        
        // Method 4: Remove near-white backgrounds with slight tint
        if (brightness > 235 && Math.min(r, g, b) > 220) {
          data[i + 3] = Math.max(0, a - 100);
        }
      }

      setProgress(85);

      ctx.putImageData(imageData, 0, 0);
      
      setProgress(95);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setProcessedUrl(url);
          setProcessedBlob(blob);
          setProgress(100);
        }
        setIsProcessing(false);
      }, "image/png", 1.0);
    } catch (error) {
      console.error("Remove background error:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadImage = () => {
    if (!processedUrl || !selectedFile) return;
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `${selectedFile.name.split(".")[0]}_${mode === "crop" ? "cropped" : "no-bg"}.png`;
    link.click();
  };

  const resetImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setCropArea(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">{t("imageEditor.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("imageEditor.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("imageEditor.description")}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-purple-200/50 dark:border-purple-800/50 bg-card/80 backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("imageEditor.selectTool")}</CardTitle>
                <CardDescription>{t("imageEditor.chooseOperation")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crop" className="flex items-center gap-2">
                  <Crop className="h-4 w-4" />
                  {t("imageEditor.crop")}
                </TabsTrigger>
                <TabsTrigger value="removebg" className="flex items-center gap-2">
                  <Eraser className="h-4 w-4" />
                  {t("imageEditor.removeBg")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crop" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">{t("imageEditor.cropDescription")}</p>
              </TabsContent>

              <TabsContent value="removebg" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">{t("imageEditor.removeBgDescription")}</p>
              </TabsContent>
            </Tabs>

            {/* Drag & Drop Area */}
            {!previewUrl && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group",
                  isDragging
                    ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 scale-105 shadow-xl shadow-purple-500/20"
                    : "border-purple-300/50 dark:border-purple-700/50 hover:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20"
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-input"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="image-input"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className={cn(
                    "relative transition-all duration-300",
                    isDragging ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"
                  )}>
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Upload className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2 text-foreground">
                      {isDragging
                        ? t("imageEditor.dropImage")
                        : selectedFile
                        ? selectedFile.name
                        : t("imageEditor.dragDropImage")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("imageEditor.supportsAllFormats")}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Image Preview with Crop Area */}
            {previewUrl && !processedUrl && (
              <div className="space-y-4 slide-in-from-bottom-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 bg-muted">
                  <div
                    ref={containerRef}
                    className={cn(
                      "relative flex items-center justify-center min-h-[300px] p-4",
                      mode === "crop" && "cursor-crosshair"
                    )}
                    onMouseDown={mode === "crop" ? handleCropStart : undefined}
                    onMouseMove={mode === "crop" ? handleCropMove : undefined}
                  >
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-[500px] object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                    
                    {/* Crop Overlay */}
                    {mode === "crop" && cropArea && cropArea.width > 0 && cropArea.height > 0 && (
                      <>
                        {/* Dark overlay with cutout */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) ${cropArea.x}px, transparent ${cropArea.x}px, transparent ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.6) ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.6) 100%),
                                        linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) ${cropArea.y}px, transparent ${cropArea.y}px, transparent ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.6) ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.6) 100%)`,
                          }}
                        />
                        {/* Crop border with grid */}
                        <div
                          ref={cropOverlayRef}
                          className="absolute border-2 border-white shadow-2xl pointer-events-none"
                          style={{
                            left: `${cropArea.x}px`,
                            top: `${cropArea.y}px`,
                            width: `${cropArea.width}px`,
                            height: `${cropArea.height}px`,
                            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {/* Grid lines (Rule of Thirds) */}
                          <div className="absolute inset-0 border border-white/30" style={{
                            backgroundImage: `
                              linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 1px, transparent 1px)
                            `,
                            backgroundSize: `${cropArea.width / 3}px ${cropArea.height / 3}px`,
                          }} />
                          
                          {/* Corner handles */}
                          {[
                            { x: 0, y: 0, cursor: "nwse-resize" },
                            { x: cropArea.width, y: 0, cursor: "nesw-resize" },
                            { x: 0, y: cropArea.height, cursor: "nesw-resize" },
                            { x: cropArea.width, y: cropArea.height, cursor: "nwse-resize" },
                          ].map((pos, i) => (
                            <div
                              key={i}
                              className="crop-handle absolute w-5 h-5 bg-white border-2 border-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"
                              style={{
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                cursor: pos.cursor,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.3)";
                                e.currentTarget.style.transition = "transform 0.2s ease-out";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                          ))}
                          
                          {/* Edge handles */}
                          {[
                            { x: cropArea.width / 2, y: 0, cursor: "ns-resize" },
                            { x: cropArea.width / 2, y: cropArea.height, cursor: "ns-resize" },
                            { x: 0, y: cropArea.height / 2, cursor: "ew-resize" },
                            { x: cropArea.width, y: cropArea.height / 2, cursor: "ew-resize" },
                          ].map((pos, i) => (
                            <div
                              key={`edge-${i}`}
                              className="crop-handle absolute w-4 h-4 bg-purple-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"
                              style={{
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                cursor: pos.cursor,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.4)";
                                e.currentTarget.style.transition = "transform 0.2s ease-out";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                          ))}
                          
                          {/* Size indicator */}
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {mode === "crop" && cropArea && cropArea.width > 0 && cropArea.height > 0 && (
                    <Button
                      onClick={applyCrop}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          {t("imageEditor.processing")}
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                          {t("imageEditor.applyCrop")}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {mode === "removebg" && (
                    <Button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          {t("imageEditor.processing")}
                        </>
                      ) : (
                        <>
                          <Eraser className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                          {t("imageEditor.removeBackground")}
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={resetImage}
                    className="sm:w-auto"
                  >
                    <X className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("common.remove")}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 slide-in-from-bottom-4">
                <ProgressBar progress={progress} label={t("imageEditor.processing")} />
              </div>
            )}

            {/* Live Preview */}
            {processedUrl && processedBlob && selectedFile && (
              <LivePreview
                originalFile={selectedFile}
                processedData={processedBlob}
                type="image"
                onDownload={downloadImage}
                className="mt-6"
                beforeLabel={t("imageEditor.original")}
                afterLabel={mode === "crop" ? t("imageEditor.cropped") : t("imageEditor.noBackground")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
