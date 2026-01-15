"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ImageIcon, FileDown, ScanText, Trash2, Sparkles, History as HistoryIcon, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";

interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  href: string;
}

export default function HistoryPage() {
  const t = useTranslations();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("toolHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const toolIcons: Record<string, any> = {
    "image-converter": ImageIcon,
    "file-compressor": FileDown,
    "ocr": ScanText,
  };

  const toolColors: Record<string, string> = {
    "image-converter": "from-blue-500 to-cyan-500",
    "file-compressor": "from-purple-500 to-pink-500",
    "ocr": "from-green-500 to-emerald-500",
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("toolHistory");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("common.now");
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString("ar-EG");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 slide-in-from-bottom-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 mb-3 sm:mb-4">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">{t("common.history")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse-glow flex items-center gap-2 sm:gap-3">
              <HistoryIcon className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-500" />
              {t("common.history")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              {history.length === 0
                ? t("common.noHistory")
                : `${history.length} ${t("common.operations")}`}
            </p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              className="bg-destructive/10 hover:bg-destructive/20 border-destructive/50 text-destructive hover:text-destructive hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <Trash2 className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              {t("common.clearHistory")}
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="shadow-2xl border-indigo-200/50 dark:border-indigo-800/50 bg-card/80 backdrop-blur-sm p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
                  <Clock className="h-16 w-16 text-indigo-500/50" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("common.noHistory")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {t("common.historyWillBeSaved")}
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
                    <Sparkles className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("common.exploreTools")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const Icon = toolIcons[item.toolId] || ImageIcon;
              const color = toolColors[item.toolId] || "from-gray-500 to-gray-600";
              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden shadow-lg border-indigo-200/50 dark:border-indigo-800/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:scale-[1.02] slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-4 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                            {item.toolName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Link href={item.href}>
                        <Button
                          variant="outline"
                          className="group/btn relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {t("common.useAgain")}
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform rtl:scale-x-[-1]" />
                          </span>
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/20 rounded-lg transition-all duration-300 pointer-events-none" />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
