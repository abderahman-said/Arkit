"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, FileDown, ScanText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropState {
  isDragging: boolean;
  files: File[];
}

const toolRoutes: Record<string, string> = {
  "image": "/image-converter",
  "application/zip": "/file-compressor",
  "application/x-zip-compressed": "/file-compressor",
  "application/x-rar-compressed": "/file-compressor",
  "application/pdf": "/ocr",
};

function detectToolFromFile(file: File): string | null {
  const mimeType = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Images
  if (mimeType.startsWith('image/')) {
    return "/image-converter";
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || 
      mimeType.includes('zip') || mimeType.includes('archive') ||
      mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
    return "/file-compressor";
  }

  // PDF
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return "/ocr";
  }

  // Default to file compressor
  return "/file-compressor";
}

export function GlobalDragDrop() {
  const t = useTranslations();
  const router = useRouter();
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    files: [],
  });
  const [showModal, setShowModal] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files.length) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the window
    if (!e.relatedTarget || (e.relatedTarget as Element).closest('body') === null) {
      setState(prev => ({ ...prev, isDragging: false }));
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      setState({ isDragging: false, files });
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  const handleToolSelect = (toolPath: string) => {
    // Store files in sessionStorage to pass to the tool
    const fileData = state.files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    sessionStorage.setItem('droppedFiles', JSON.stringify(fileData));
    sessionStorage.setItem('droppedFilesCount', state.files.length.toString());
    
    router.push(toolPath);
    setShowModal(false);
    setState({ isDragging: false, files: [] });
  };

  const getSuggestedTool = (): string | null => {
    if (state.files.length === 0) return null;
    const firstFile = state.files[0];
    return detectToolFromFile(firstFile);
  };

  if (!state.isDragging && !showModal) return null;

  const suggestedTool = getSuggestedTool();

  return (
    <>
      {/* Drag Overlay */}
      {state.isDragging && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-6 p-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse" />
              <div className="relative p-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-4 border-primary/50">
                <Upload className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t("dragDrop.dropFiles")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("dragDrop.releaseToProcess")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tool Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{t("dragDrop.selectTool")}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false);
                    setState({ isDragging: false, files: [] });
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  {t("dragDrop.filesSelected", { count: state.files.length })}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {state.files.slice(0, 5).map((file, index) => (
                    <div key={index} className="text-xs p-2 rounded bg-muted">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  ))}
                  {state.files.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{state.files.length - 5} {t("dragDrop.moreFiles")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {suggestedTool && (
                  <Button
                    onClick={() => handleToolSelect(suggestedTool)}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
                    size="lg"
                  >
                    {suggestedTool === "/image-converter" && <ImageIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />}
                    {suggestedTool === "/file-compressor" && <FileDown className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />}
                    {suggestedTool === "/ocr" && <ScanText className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />}
                    {t("dragDrop.useSuggestedTool")}
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleToolSelect("/image-converter")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs">{t("tools.imageConverter.title")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToolSelect("/file-compressor")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <FileDown className="h-5 w-5" />
                    <span className="text-xs">{t("tools.fileCompressor.title")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToolSelect("/ocr")}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <ScanText className="h-5 w-5" />
                    <span className="text-xs">{t("tools.ocr.title")}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

