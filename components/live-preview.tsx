"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, X, Download, ArrowRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

interface LivePreviewProps {
  originalFile: File | null;
  processedData?: string | Blob | null;
  type: "image" | "text" | "file";
  onDownload?: () => void;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function LivePreview({
  originalFile,
  processedData,
  type,
  onDownload,
  beforeLabel,
  afterLabel,
  className
}: LivePreviewProps) {
  const t = useTranslations();
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originalFile]);

  useEffect(() => {
    if (processedData) {
      if (processedData instanceof Blob) {
        const url = URL.createObjectURL(processedData);
        setProcessedUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (typeof processedData === "string") {
        setProcessedUrl(processedData);
      }
    }
  }, [processedData]);

  if (!originalFile && !processedData) return null;

  if (type === "image" && originalFile && processedData) {
    return (
      <Card className={cn("shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("livePreview.title")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("livePreview.description")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-primary/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        {isOpen && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-muted text-sm">
                      {beforeLabel || t("livePreview.before")}
                    </span>
                  </h3>
                  {originalFile && (
                    <span className="text-xs text-muted-foreground">
                      {(originalFile.size / 1024).toFixed(2)} KB
                    </span>
                  )}
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-border bg-muted">
                  {originalUrl && (
                    <NextImage
                      src={originalUrl}
                      alt="Original"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary to-purple-600">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* After */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-sm">
                      {afterLabel || t("livePreview.after")}
                    </span>
                  </h3>
                  {processedData instanceof Blob && (
                    <span className="text-xs text-muted-foreground">
                      {(processedData.size / 1024).toFixed(2)} KB
                    </span>
                  )}
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary bg-muted">
                  {processedUrl && (
                    <NextImage
                      src={processedUrl}
                      alt="Processed"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {originalFile && processedData instanceof Blob && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {((1 - processedData.size / originalFile.size) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{t("livePreview.saved")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {(originalFile.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-xs text-muted-foreground">{t("livePreview.original")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {(processedData.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-xs text-muted-foreground">{t("livePreview.processed")}</p>
                </div>
              </div>
            )}

            {/* Download Button */}
            {onDownload && (
              <Button
                onClick={onDownload}
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg hover:shadow-xl"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t("livePreview.download")}
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  if (type === "text" && processedData) {
    return (
      <Card className={cn("shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("livePreview.extractedText")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("livePreview.textPreview")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted border-2 border-primary/20 min-h-[200px] max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
              {typeof processedData === "string" ? processedData : "Processing..."}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

