"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  Sparkles, 
  ImageIcon, 
  FileDown, 
  ScanText,
  Plus,
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivacyBadge } from "@/components/privacy-badge";

interface ChainStep {
  id: string;
  toolId: string;
  toolName: string;
  toolIcon: React.ComponentType<{ className?: string }>;
  color: string;
  config?: Record<string, unknown>;
}

interface PresetChain {
  id: string;
  name: string;
  description: string;
  steps: Omit<ChainStep, "id">[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const availableTools = [
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert images to different formats",
    icon: ImageIcon,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "file-compressor",
    name: "File Compressor",
    description: "Compress files into ZIP",
    icon: FileDown,
    color: "from-purple-500 to-blue-500",
  },
  {
    id: "ocr",
    name: "OCR",
    description: "Extract text from images",
    icon: ScanText,
    color: "from-green-500 to-emerald-500",
  },
];

const presetChains: PresetChain[] = [
  {
    id: "image-to-webp-compress",
    name: "Image to WebP + Compress",
    description: "Convert image to WebP format and compress it",
    icon: ImageIcon,
    color: "from-blue-500 to-purple-500",
    steps: [
      {
        toolId: "image-converter",
        toolName: "Image Converter",
        toolIcon: ImageIcon,
        color: "from-blue-500 to-cyan-500",
        config: { format: "webp" },
      },
      {
        toolId: "file-compressor",
        toolName: "File Compressor",
        toolIcon: FileDown,
        color: "from-purple-500 to-blue-500",
      },
    ],
  },
  {
    id: "ocr-extract-compress",
    name: "OCR + Extract + Compress",
    description: "Extract text from image and compress results",
    icon: ScanText,
    color: "from-green-500 to-blue-500",
    steps: [
      {
        toolId: "ocr",
        toolName: "OCR",
        toolIcon: ScanText,
        color: "from-green-500 to-emerald-500",
      },
      {
        toolId: "file-compressor",
        toolName: "File Compressor",
        toolIcon: FileDown,
        color: "from-purple-500 to-blue-500",
      },
    ],
  },
];

export default function SmartChainPage() {
  const t = useTranslations();
  const [selectedChain, setSelectedChain] = useState<ChainStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const addStep = useCallback((tool: typeof availableTools[0]) => {
    const newStep: ChainStep = {
      id: `step-${Date.now()}`,
      toolId: tool.id,
      toolName: tool.name,
      toolIcon: tool.icon,
      color: tool.color,
    };
    setSelectedChain((prev) => [...prev, newStep]);
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSelectedChain((prev) => prev.filter((step) => step.id !== stepId));
  }, []);

  const loadPreset = useCallback((preset: PresetChain) => {
    const steps: ChainStep[] = preset.steps.map((step, index) => ({
      ...step,
      id: `preset-step-${index}`,
    }));
    setSelectedChain(steps);
  }, []);

  const executeChain = useCallback(async () => {
    if (selectedChain.length === 0) return;

    setIsExecuting(true);
    setCurrentStep(0);
    setResults({});

    // Simulate chain execution
    for (let i = 0; i < selectedChain.length; i++) {
      setCurrentStep(i);
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults((prev) => ({
        ...prev,
        [selectedChain[i].id]: { success: true, message: "Completed" },
      }));
    }

    setIsExecuting(false);
    setCurrentStep(-1);
  }, [selectedChain]);

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 dark:bg-primary/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Link2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">{t("smartChain.title")}</span>
            </div>
            <PrivacyBadge variant="compact" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("smartChain.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("smartChain.description")}
          </p>
        </div>

        {/* Preset Chains */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("smartChain.presetChains")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presetChains.map((preset) => {
              const Icon = preset.icon;
              return (
                <Card
                  key={preset.id}
                  className="group relative overflow-hidden bg-gradient-to-br border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                  onClick={() => loadPreset(preset)}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                    preset.color
                  )} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                        preset.color
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadPreset(preset);
                        }}
                        className="hover:bg-primary/10"
                      >
                        {t("smartChain.usePreset")}
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{preset.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {preset.steps.map((step, index) => {
                        const StepIcon = step.toolIcon;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className={cn(
                              "px-3 py-1.5 rounded-lg bg-gradient-to-r text-white text-xs font-semibold flex items-center gap-1.5",
                              step.color
                            )}>
                              <StepIcon className="h-3 w-3" />
                              {step.toolName}
                            </div>
                            {index < preset.steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Chain Builder */}
        <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("smartChain.buildChain")}</CardTitle>
                <CardDescription>{t("smartChain.buildChainDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Available Tools */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t("smartChain.availableTools")}</h3>
              <div className="flex flex-wrap gap-3">
                {availableTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Button
                      key={tool.id}
                      variant="outline"
                      onClick={() => addStep(tool)}
                      className={cn(
                        "flex items-center gap-2 hover:scale-105 transition-all duration-300",
                        `hover:border-${tool.color.split(' ')[0]}/50`
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tool.name}
                      <Plus className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Selected Chain */}
            {selectedChain.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("smartChain.yourChain")}</h3>
                <div className="space-y-3">
                  {selectedChain.map((step, index) => {
                    const Icon = step.toolIcon;
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300",
                          currentStep === index && isExecuting
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          step.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{step.toolName}</p>
                          <p className="text-sm text-muted-foreground">
                            {availableTools.find((t) => t.id === step.toolId)?.description}
                          </p>
                        </div>
                        {currentStep === index && isExecuting && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {results[step.id]?.success && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                        {!isExecuting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(step.id)}
                            className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {index < selectedChain.length - 1 && (
                          <div className="absolute left-1/2 -translate-x-1/2 mt-12 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2">
                            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 rtl:rotate-[-90deg]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={executeChain}
                  disabled={isExecuting}
                  className={cn(
                    "w-full bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                    isExecuting && "opacity-50 cursor-not-allowed"
                  )}
                  size="lg"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t("smartChain.executing")} ({currentStep + 1}/{selectedChain.length})
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t("smartChain.executeChain")}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {selectedChain.length === 0 && (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                    <Link2 className="h-16 w-16 text-primary/50" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{t("smartChain.noSteps")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("smartChain.noStepsDescription")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

