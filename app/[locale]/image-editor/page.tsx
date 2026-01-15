"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Sparkles, Image as ImageIcon, Crop, Eraser, X, Check, Loader2, Wand2
} from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { LivePreview } from "@/components/live-preview";
import { incrementImagesUploaded } from "@/lib/stats";
import { getToolSettings, saveToolSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { detectSubject, removeBackground as removeBackgroundLib, cropImage, Rect } from "@/lib/image-processing";
import { CropOverlay } from "@/components/image-editor/crop-overlay";

type EditorMode = "crop" | "removebg";

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
  const [cropArea, setCropArea] = useState<Rect | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [moveStart, setMoveStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ cropArea: Rect; mouseX: number; mouseY: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Load saved settings
  useEffect(() => {
    const settings = getToolSettings("image-editor");
    if (settings.mode) {
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
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

  // Auto-detect subject for smart cropping
  const autoDetectSubject = useCallback(async () => {
    if (!previewUrl || !imageRef.current) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const rect = await detectSubject(previewUrl, setProgress);

      if (rect) {
        const displayRect = getImageDisplayRect();
        if (displayRect && imageRef.current) {
          const scaleX = displayRect.width / imageRef.current.naturalWidth;
          const scaleY = displayRect.height / imageRef.current.naturalHeight;

          setCropArea({
            x: rect.x * scaleX,
            y: rect.y * scaleY,
            width: rect.width * scaleX,
            height: rect.height * scaleY
          });
        }
      }
      setIsProcessing(false);
    } catch (error) {
      console.error("Auto-detect error:", error);
      setIsProcessing(false);
    }
  }, [previewUrl, getImageDisplayRect]);

  const startCropAction = useCallback((x: number, y: number) => {
    const displayRect = getImageDisplayRect();
    if (!displayRect) return;

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(displayRect.width, x));
    const clampedY = Math.max(0, Math.min(displayRect.height, y));

    setCropStart({ x: clampedX, y: clampedY });
    setIsCropping(true);
    setCropArea({ x: clampedX, y: clampedY, width: 0, height: 0 });
  }, [getImageDisplayRect]);

  const handleMouseCropStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewUrl || mode !== "crop" || !imageRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('.crop-handle') || target.closest('.crop-move-area')) return;

    e.preventDefault();
    e.stopPropagation();

    const displayRect = getImageDisplayRect();
    if (!displayRect) return;

    const containerRect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - containerRect.left - displayRect.left;
    const y = e.clientY - containerRect.top - displayRect.top;

    startCropAction(x, y);
  }, [previewUrl, mode, getImageDisplayRect, startCropAction]);

  const updateCropAction = useCallback((clientX: number, clientY: number) => {
    if (!cropStart || !imageRef.current || !containerRef.current) return;

    const displayRect = getImageDisplayRect();
    if (!displayRect) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = clientX - containerRect.left - displayRect.left;
    const currentY = clientY - containerRect.top - displayRect.top;

    const clampedX = Math.max(0, Math.min(displayRect.width, currentX));
    const clampedY = Math.max(0, Math.min(displayRect.height, currentY));

    const x = Math.min(cropStart.x, clampedX);
    const y = Math.min(cropStart.y, clampedY);
    const width = Math.abs(clampedX - cropStart.x);
    const height = Math.abs(clampedY - cropStart.y);

    setCropArea({ x, y, width, height });
  }, [cropStart, getImageDisplayRect]);

  const handleCropMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart || !previewUrl || !imageRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateCropAction(e.clientX, e.clientY));
  }, [isCropping, cropStart, previewUrl, updateCropAction]);

  const handleCropEnd = useCallback(() => {
    setIsCropping(false);
    setIsResizing(false);
    setIsMoving(false);
    setResizeHandle(null);
    setMoveStart(null);
    setResizeStart(null);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, handle: string) => {
    if (!cropArea) return;
    // Don't prevent default here for touch events to allow starting the gesture properly
    // but we need to stop propagation to prevent other interactions
    e.stopPropagation();

    setResizeHandle(handle);
    setIsResizing(true);
    const containerRect = containerRef.current!.getBoundingClientRect();
    const displayRect = getImageDisplayRect();
    if (displayRect) {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        e.preventDefault();
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const mouseX = clientX - containerRect.left - displayRect.left;
      const mouseY = clientY - containerRect.top - displayRect.top;
      setResizeStart({ cropArea: { ...cropArea }, mouseX, mouseY });
    }
  }, [cropArea, getImageDisplayRect]);

  const handleMoveStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!cropArea) return;
    // Don't prevent default here for touch events
    e.stopPropagation();

    setIsMoving(true);
    const containerRect = containerRef.current!.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      e.preventDefault();
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    setMoveStart({ x: clientX - containerRect.left, y: clientY - containerRect.top });
  }, [cropArea]);

  useEffect(() => {
    if (!isCropping && !isResizing && !isMoving) return;

    const handleInteractionMove = (clientX: number, clientY: number) => {
      if (!imageRef.current || !containerRef.current) return;
      const displayRect = getImageDisplayRect();
      if (!displayRect) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (isCropping && cropStart) {
          updateCropAction(clientX, clientY);
        } else if (isResizing && resizeHandle && resizeStart) {
          const currentX = clientX - containerRect.left - displayRect.left;
          const currentY = clientY - containerRect.top - displayRect.top;

          const startArea = resizeStart.cropArea;
          const deltaX = currentX - resizeStart.mouseX;
          const deltaY = currentY - resizeStart.mouseY;

          let newX = startArea.x;
          let newY = startArea.y;
          let newWidth = startArea.width;
          let newHeight = startArea.height;

          if (resizeHandle.includes('top')) {
            newY = Math.max(0, Math.min(startArea.y + startArea.height - 20, startArea.y + deltaY));
            newHeight = startArea.height + (startArea.y - newY);
          }
          if (resizeHandle.includes('bottom')) {
            newHeight = Math.max(20, Math.min(displayRect.height - startArea.y, startArea.height + deltaY));
          }
          if (resizeHandle.includes('left')) {
            newX = Math.max(0, Math.min(startArea.x + startArea.width - 20, startArea.x + deltaX));
            newWidth = startArea.width + (startArea.x - newX);
          }
          if (resizeHandle.includes('right')) {
            newWidth = Math.max(20, Math.min(displayRect.width - startArea.x, startArea.width + deltaX));
          }

          if (newX < 0) { newWidth += newX; newX = 0; }
          if (newY < 0) { newHeight += newY; newY = 0; }
          if (newX + newWidth > displayRect.width) newWidth = displayRect.width - newX;
          if (newY + newHeight > displayRect.height) newHeight = displayRect.height - newY;

          setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
        } else if (isMoving && cropArea && moveStart) {
          const deltaX = (clientX - containerRect.left) - moveStart.x;
          const deltaY = (clientY - containerRect.top) - moveStart.y;
          const newX = Math.max(0, Math.min(displayRect.width - cropArea.width, cropArea.x + deltaX));
          const newY = Math.max(0, Math.min(displayRect.height - cropArea.height, cropArea.y + deltaY));

          setCropArea({ ...cropArea, x: newX, y: newY });
          setMoveStart({ x: clientX - containerRect.left, y: clientY - containerRect.top });
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling while interacting
      handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => handleCropEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCropping, isResizing, isMoving, cropStart, resizeHandle, resizeStart, moveStart, cropArea, getImageDisplayRect, handleCropEnd, updateCropAction]);

  const handleTouchCropStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!previewUrl || mode !== "crop" || !imageRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('.crop-handle') || target.closest('.crop-move-area')) return;

    // e.preventDefault() here might block scroll on the initial touch, which might be desired if starting a crop
    // but sometimes users want to scroll. Let's start cropping only if they tap/drag on the image.

    const displayRect = getImageDisplayRect();
    if (!displayRect) return;
    const containerRect = containerRef.current!.getBoundingClientRect();
    const x = e.touches[0].clientX - containerRect.left - displayRect.left;
    const y = e.touches[0].clientY - containerRect.top - displayRect.top;

    startCropAction(x, y);
  }, [previewUrl, mode, getImageDisplayRect, startCropAction]);

  const applyCrop = async () => {
    if (!previewUrl || !cropArea || !selectedFile || cropArea.width <= 0 || cropArea.height <= 0) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const displayRect = getImageDisplayRect();
      if (!displayRect) {
        setIsProcessing(false);
        return;
      }
      const blob = await cropImage(
        previewUrl,
        cropArea,
        { width: displayRect.width, height: displayRect.height },
        selectedFile.type || "image/png",
        setProgress
      );
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
        setProcessedBlob(blob);
      }
      setIsProcessing(false);
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const removeBackground = async () => {
    if (!previewUrl || !selectedFile) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const blob = await removeBackgroundLib(previewUrl, setProgress);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
        setProcessedBlob(blob);
      }
      setIsProcessing(false);
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <p className="text-sm text-muted-foreground flex-1">{t("imageEditor.cropDescription")}</p>
                  <Button
                    onClick={autoDetectSubject}
                    disabled={!previewUrl || isProcessing}
                    variant="outline"
                    size="sm"
                    className="sm:w-auto"
                  >
                    <Wand2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("imageEditor.autoDetect")}
                  </Button>
                </div>
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
                    onMouseDown={mode === "crop" ? handleMouseCropStart : undefined}
                    onMouseMove={mode === "crop" ? handleCropMove : undefined}
                    onTouchStart={mode === "crop" ? handleTouchCropStart : undefined}
                  >
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-[500px] object-contain select-none pointer-events-none"
                      draggable={false}
                    />

                    {mode === "crop" && cropArea && (
                      <CropOverlay
                        cropArea={cropArea}
                        onResizeStart={handleResizeStart}
                        onMoveStart={handleMoveStart}
                        isMoving={isMoving}
                      />
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
