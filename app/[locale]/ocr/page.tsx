"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Check, ScanText, Sparkles, CheckCircle2, Zap, FileText, X } from "lucide-react";
import { createWorker } from "tesseract.js";
import { ProgressBar } from "@/components/progress-bar";
import { incrementImagesUploaded, incrementOCRProcessed } from "@/lib/stats";

export default function OCRPage() {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setExtractedText("");
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
      setExtractedText("");
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

  const extractText = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const worker = await createWorker("eng+ara", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          } else if (m.status === "loading tesseract core") {
            setProgress(10);
          } else if (m.status === "initializing tesseract") {
            setProgress(20);
          } else if (m.status === "loading language traineddata") {
            setProgress(40);
          }
        },
      });

      const { data: { text } } = await worker.recognize(selectedFile);
      setExtractedText(text);
      setProgress(100);
      await worker.terminate();
      incrementOCRProcessed();
    } catch (error) {
      console.error("OCR error:", error);
      setExtractedText(t("tools.ocr.processing") + " - " + t("common.error") || "حدث خطأ أثناء استخراج النص. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 dark:bg-green-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">{t("tools.ocr.title")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("tools.ocr.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("tools.ocr.description")}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-green-200/50 dark:border-green-800/50 bg-card/80 backdrop-blur-sm hover:shadow-green-500/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <ScanText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("tools.ocr.selectImage")}</CardTitle>
                <CardDescription>{t("tools.ocr.description")}</CardDescription>
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
                  ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20 scale-105 shadow-xl shadow-green-500/20"
                  : "border-green-300/50 dark:border-green-700/50 hover:border-green-500/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="ocr-input"
                disabled={isProcessing}
              />
              <label
                htmlFor="ocr-input"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className={`relative transition-all duration-300 ${isDragging ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"}`}>
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2 text-foreground">
                    {isDragging
                      ? t("tools.ocr.dropImage")
                      : selectedFile
                      ? selectedFile.name
                      : t("tools.ocr.dragDropImage")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.ocr.supportsArabicEnglish")}
                  </p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-4 slide-in-from-bottom-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ScanText className="h-5 w-5 text-green-500" />
                      {t("tools.ocr.imagePreview")}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setExtractedText("");
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {t("common.remove")}
                    </Button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border-2 border-green-200/50 dark:border-green-800/50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-64 object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 slide-in-from-bottom-4">
                <ProgressBar progress={progress} label={t("tools.ocr.extracting")} />
              </div>
            )}

            {/* Extract Button */}
            {selectedFile && !extractedText && (
              <Button
                onClick={extractText}
                disabled={isProcessing}
                className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 animate-spin" />
                    {t("tools.ocr.extracting")}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("tools.ocr.extract")}
                  </>
                )}
              </Button>
            )}

            {/* Extracted Text */}
            {extractedText && (
              <div className="space-y-4 slide-in-from-bottom-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">{t("tools.ocr.extractionSuccess")} 🎉</h3>
                        <p className="text-sm text-muted-foreground">{t("tools.ocr.textReady")}</p>
                      </div>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className={`transition-all duration-300 hover:scale-105 ${
                        copied
                          ? "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                          {t("tools.ocr.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                          {t("tools.ocr.copy")}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="p-6 rounded-xl bg-white/50 dark:bg-black/20 border border-blue-200/50 dark:border-blue-800/50 min-h-[200px] max-h-96 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {t("tools.ocr.extractedText")}:
                      </div>
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground">
                        {extractedText || t("tools.ocr.noTextExtracted")}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
