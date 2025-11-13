"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Image as ImageIcon, Sparkles, CheckCircle2, Palette, Zap, X } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { LivePreview } from "@/components/live-preview";
import { incrementImagesUploaded, incrementConversions } from "@/lib/stats";
import { getToolSettings, saveToolSettings } from "@/lib/settings";
import { useEffect } from "react";

type ImageFormat = "jpg" | "png" | "webp" | "avif";

export default function ImageConverterPage() {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>("png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  // Load saved settings
  useEffect(() => {
    const settings = getToolSettings("image-converter");
    if (settings.outputFormat) {
      setOutputFormat(settings.outputFormat as ImageFormat);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    saveToolSettings("image-converter", { outputFormat });
  }, [outputFormat]);

  // Track tool usage for Quick Actions
  useEffect(() => {
    if (selectedFile) {
      const event = new CustomEvent('tool-used', {
        detail: {
          toolId: 'image-converter',
          toolHref: '/image-converter'
        }
      });
      window.dispatchEvent(event);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setConvertedUrl(null);
      setProgress(0);
      setPreviewUrl(URL.createObjectURL(file));
      incrementImagesUploaded(1);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setConvertedUrl(null);
      setProgress(0);
      setPreviewUrl(URL.createObjectURL(file));
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

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setProgress(100);
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setConvertedBlob(blob);
              incrementConversions();
            }
            setIsProcessing(false);
            clearInterval(progressInterval);
          },
          `image/${outputFormat}`,
          0.9
        );
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error("Conversion error:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl) return;
    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `${selectedFile?.name.split(".")[0]}.${outputFormat}`;
    link.click();
  };

  const formatOptions = [
    { value: "png", label: "PNG", color: "from-blue-500 to-cyan-500" },
    { value: "jpg", label: "JPG", color: "from-orange-500 to-red-500" },
    { value: "webp", label: "WEBP", color: "from-green-500 to-emerald-500" },
    { value: "avif", label: "AVIF", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">{t("tools.imageConverter.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("tools.imageConverter.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("tools.imageConverter.description")}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-blue-200/50 dark:border-blue-800/50 bg-card/80 backdrop-blur-sm hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("tools.imageConverter.selectFormat")}</CardTitle>
                <CardDescription>{t("tools.imageConverter.chooseFormat")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-500" />
                {t("tools.imageConverter.chooseFormat")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value as ImageFormat)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      outputFormat === format.value
                        ? `  bg-gradient-to-br ${format.color} text-white shadow-lg`
                        : "border-border   bg-card/50"
                    }`}
                  >
                    <div className="font-bold text-lg">{format.label}</div>
                    {outputFormat === format.value && (
                      <CheckCircle2 className="h-5 w-5 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group ${
                isDragging
                  ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 scale-105 shadow-xl shadow-blue-500/20"
                  : "border-blue-300/50 dark:border-blue-700/50 hover:border-blue-500/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20"
              }`}
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
                <div className={`relative transition-all duration-300 ${isDragging ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"}`}>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2 text-foreground">
                    {isDragging
                      ? t("tools.imageConverter.dropImage")
                      : selectedFile
                      ? selectedFile.name
                      : t("tools.imageConverter.dragDropImage")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.imageConverter.supportsAllFormats")}
                  </p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-4 slide-in-from-bottom-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                      {t("tools.imageConverter.imagePreview")}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setConvertedUrl(null);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {t("common.remove")}
                    </Button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 slide-in-from-bottom-4">
                <ProgressBar progress={progress} label={t("tools.imageConverter.converting")} />
              </div>
            )}

            {/* Convert Button */}
            {selectedFile && !convertedUrl && (
              <Button
                onClick={convertImage}
                disabled={isProcessing}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 animate-spin" />
                    {t("tools.imageConverter.converting")}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("tools.imageConverter.convert")}
                  </>
                )}
              </Button>
            )}

            {/* Live Preview */}
            {convertedUrl && convertedBlob && selectedFile && (
              <LivePreview
                originalFile={selectedFile}
                processedData={convertedBlob}
                type="image"
                onDownload={downloadImage}
                className="mt-6"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
