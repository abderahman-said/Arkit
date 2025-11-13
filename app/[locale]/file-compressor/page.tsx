"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileDown, File, Archive, Sparkles, CheckCircle2, Zap, TrendingDown, X } from "lucide-react";
import JSZip from "jszip";
import { ProgressBar } from "@/components/progress-bar";
import { incrementFilesCompressed } from "@/lib/stats";

export default function FileCompressorPage() {
  const t = useTranslations();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setCompressedUrl(null);
    setOriginalSize(files.reduce((acc, file) => acc + file.size, 0));
    setCompressedSize(0);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    setCompressedUrl(null);
    setOriginalSize(files.reduce((acc, file) => acc + file.size, 0));
    setCompressedSize(0);
    setProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setOriginalSize(newFiles.reduce((acc, file) => acc + file.size, 0));
    setCompressedUrl(null);
    setCompressedSize(0);
  };

  const compressFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      const totalFiles = selectedFiles.length;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        zip.file(file.name, file);
        setProgress((i + 1) * (90 / totalFiles));
      }

      const blob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE" },
        (metadata) => {
          if (metadata.percent) {
            setProgress(90 + metadata.percent * 0.1);
          }
        }
      );
      
      setProgress(100);
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
      setCompressedSize(blob.size);
      setIsProcessing(false);
      incrementFilesCompressed();
    } catch (error) {
      console.error("Compression error:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadCompressed = () => {
    if (!compressedUrl) return;
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = "compressed.zip";
    link.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const compressionRatio = originalSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">{t("tools.fileCompressor.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("tools.fileCompressor.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("tools.fileCompressor.description")}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-purple-200/50 dark:border-purple-800/50 bg-card/80 backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                <Archive className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("tools.fileCompressor.selectFiles")}</CardTitle>
                <CardDescription>{t("tools.fileCompressor.dragDropFiles")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group ${
                isDragging
                  ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 scale-105 shadow-xl shadow-purple-500/20"
                  : "border-purple-300/50 dark:border-purple-700/50 hover:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20"
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isProcessing}
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className={`relative transition-all duration-300 ${isDragging ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"}`}>
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2 text-foreground">
                    {isDragging
                      ? t("tools.fileCompressor.dropFiles")
                      : selectedFiles.length > 0
                      ? `${selectedFiles.length} ${t("tools.fileCompressor.filesSelected")}`
                      : t("tools.fileCompressor.dragDropFiles")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.fileCompressor.supportsAllFiles")}
                  </p>
                </div>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4 slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileDown className="h-5 w-5 text-purple-500" />
                    {t("tools.fileCompressor.filesSelectedCount")} ({selectedFiles.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFiles([]);
                      setCompressedUrl(null);
                      setOriginalSize(0);
                      setCompressedSize(0);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("common.clearAll")}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="group relative p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200/50 dark:border-purple-800/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          <File className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate mb-1">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    {t("tools.fileCompressor.totalSize")}: <span className="text-purple-600 dark:text-purple-400 font-bold">{formatBytes(originalSize)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 slide-in-from-bottom-4">
                <ProgressBar progress={progress} label={t("tools.fileCompressor.compressing")} />
              </div>
            )}

            {/* Compress Button */}
            {selectedFiles.length > 0 && !compressedUrl && (
              <Button
                onClick={compressFiles}
                disabled={isProcessing}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 animate-spin" />
                    {t("tools.fileCompressor.compressing")}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("tools.fileCompressor.compress")}
                  </>
                )}
              </Button>
            )}

            {/* Results */}
            {compressedUrl && (
              <div className="space-y-6 slide-in-from-bottom-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-500/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-700 dark:text-green-400">{t("tools.fileCompressor.compressionSuccess")} 🎉</h3>
                      <p className="text-sm text-muted-foreground">{t("tools.fileCompressor.readyToDownload")}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Archive className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-muted-foreground">{t("tools.fileCompressor.originalSize")}</span>
                      </div>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatBytes(originalSize)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-muted-foreground">{t("tools.fileCompressor.compressedSize")}</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatBytes(compressedSize)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-muted-foreground">{t("tools.fileCompressor.compressionRatio")}</span>
                      </div>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{compressionRatio}%</p>
                    </div>
                  </div>

                  <Button
                    onClick={downloadCompressed}
                    className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Download className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("tools.fileCompressor.download")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

