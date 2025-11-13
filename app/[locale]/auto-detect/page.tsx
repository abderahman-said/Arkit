"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Sparkles, 
  ImageIcon, 
  FileDown, 
  ScanText, 
  ArrowRight,
  CheckCircle2,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivacyBadge } from "@/components/privacy-badge";

interface DetectedTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  priority: number;
}

export default function AutoDetectPage() {
  const t = useTranslations();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedTools, setDetectedTools] = useState<DetectedTool[]>([]);
  const [fileType, setFileType] = useState<string>("");

  const detectFileType = useCallback((file: File): string => {
    const mimeType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Images
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    // Videos
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    // Audio
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    // PDF
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || 
        mimeType.includes('zip') || mimeType.includes('archive')) {
      return 'archive';
    }
    // Documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'document';
    }
    // Text
    if (mimeType.startsWith('text/') || ['txt', 'md', 'json', 'xml'].includes(extension)) {
      return 'text';
    }

    return 'unknown';
  }, []);

  const suggestTools = useCallback((fileType: string): DetectedTool[] => {
    const tools: DetectedTool[] = [];

    switch (fileType) {
      case 'image':
        tools.push({
          id: 'image-converter',
          name: t("tools.imageConverter.title"),
          description: t("tools.imageConverter.description"),
          icon: ImageIcon,
          href: '/image-converter',
          color: 'from-blue-500 to-cyan-500',
          priority: 1
        });
        tools.push({
          id: 'file-compressor',
          name: t("tools.fileCompressor.title"),
          description: t("tools.fileCompressor.description"),
          icon: FileDown,
          href: '/file-compressor',
          color: 'from-purple-500 to-blue-500',
          priority: 2
        });
        tools.push({
          id: 'ocr',
          name: t("tools.ocr.title"),
          description: t("tools.ocr.description"),
          icon: ScanText,
          href: '/ocr',
          color: 'from-green-500 to-emerald-500',
          priority: 3
        });
        break;

      case 'pdf':
        tools.push({
          id: 'ocr',
          name: t("tools.ocr.title"),
          description: t("tools.ocr.description"),
          icon: ScanText,
          href: '/ocr',
          color: 'from-green-500 to-emerald-500',
          priority: 1
        });
        tools.push({
          id: 'file-compressor',
          name: t("tools.fileCompressor.title"),
          description: t("tools.fileCompressor.description"),
          icon: FileDown,
          href: '/file-compressor',
          color: 'from-purple-500 to-blue-500',
          priority: 2
        });
        break;

      case 'archive':
        tools.push({
          id: 'file-compressor',
          name: t("tools.fileCompressor.title"),
          description: t("tools.fileCompressor.description"),
          icon: FileDown,
          href: '/file-compressor',
          color: 'from-purple-500 to-blue-500',
          priority: 1
        });
        break;

      case 'text':
        tools.push({
          id: 'file-compressor',
          name: t("tools.fileCompressor.title"),
          description: t("tools.fileCompressor.description"),
          icon: FileDown,
          href: '/file-compressor',
          color: 'from-purple-500 to-blue-500',
          priority: 1
        });
        break;

      default:
        tools.push({
          id: 'file-compressor',
          name: t("tools.fileCompressor.title"),
          description: t("tools.fileCompressor.description"),
          icon: FileDown,
          href: '/file-compressor',
          color: 'from-purple-500 to-blue-500',
          priority: 1
        });
    }

    return tools.sort((a, b) => a.priority - b.priority);
  }, [t]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const detectedType = detectFileType(selectedFile);
    setFileType(detectedType);
    const tools = suggestTools(detectedType);
    setDetectedTools(tools);
  }, [suggestTools, detectFileType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const getFileTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      image: t("autoDetect.image"),
      video: t("autoDetect.video"),
      audio: t("autoDetect.audio"),
      pdf: t("autoDetect.pdf"),
      archive: t("autoDetect.archive"),
      document: t("autoDetect.document"),
      text: t("autoDetect.text"),
      unknown: t("autoDetect.unknown")
    };
    return labels[type] || labels.unknown;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 dark:bg-primary/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">{t("autoDetect.title")}</span>
            </div>
            <PrivacyBadge variant="compact" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("autoDetect.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("autoDetect.description")}
          </p>
        </div>

        {/* File Upload Area */}
        <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm hover:shadow-primary/10 transition-all duration-300 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("autoDetect.uploadFile")}</CardTitle>
                <CardDescription>{t("autoDetect.uploadDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
                isDragging
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="*/*"
              />
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className={cn(
                  "p-4 rounded-full mb-4 transition-all duration-300",
                  isDragging
                    ? "bg-gradient-to-br from-primary to-purple-500 scale-110"
                    : "bg-gradient-to-br from-primary/20 to-purple-500/20"
                )}>
                  <Upload className={cn(
                    "h-10 w-10 transition-all duration-300",
                    isDragging ? "text-white animate-bounce" : "text-primary"
                  )} />
                </div>
                <p className="mb-2 text-lg font-semibold text-foreground">
                  {isDragging
                    ? t("autoDetect.dropFile")
                    : file
                    ? file.name
                    : t("autoDetect.dragDropFile")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("autoDetect.supportsAllFiles")}
                </p>
              </div>
            </label>

            {file && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("autoDetect.detectedType")}: <span className="text-primary font-medium">{getFileTypeLabel(fileType)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Tools */}
        {detectedTools.length > 0 && (
          <div className="space-y-4 slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{t("autoDetect.suggestedTools")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detectedTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className={cn(
                      "group relative overflow-hidden bg-gradient-to-br border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 slide-in-from-bottom-4",
                      `from-${tool.color.split(' ')[0]}/10 to-${tool.color.split(' ')[2]}/10`,
                      `border-${tool.color.split(' ')[0]}/20 hover:border-${tool.color.split(' ')[0]}/40`
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                      tool.color
                    )} />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                          tool.color
                        )}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          #{index + 1}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                      <Button
                        onClick={() => router.push(tool.href)}
                        className={cn(
                          "w-full bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                          tool.color
                        )}
                      >
                        {t("common.useTool")}
                        <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!file && (
          <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <Brain className="h-16 w-16 text-primary/50" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("autoDetect.uploadToStart")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {t("autoDetect.uploadToStartDescription")}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

