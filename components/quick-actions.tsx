"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, X, ImageIcon, FileDown, ScanText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentTool {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp: number;
}

const STORAGE_KEY = "recent_tools";
const MAX_RECENT_TOOLS = 3;

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "image-converter": ImageIcon,
  "file-compressor": FileDown,
  "ocr": ScanText,
};

const toolNames: Record<string, string> = {
  "image-converter": "tools.imageConverter.title",
  "file-compressor": "tools.fileCompressor.title",
  "ocr": "tools.ocr.title",
};

export function QuickActions() {
  const t = useTranslations();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    // Load recent tools from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const tools = JSON.parse(stored);
        setRecentTools(tools.slice(0, MAX_RECENT_TOOLS));
      } catch (e) {
        console.error("Failed to parse recent tools", e);
      }
    }

    // Listen for tool usage
    const handleToolUsage = (event: CustomEvent) => {
      const { toolId, toolHref } = event.detail;
      const Icon = toolIcons[toolId] || ImageIcon;
      const name = toolNames[toolId] || toolId;

      const newTool: RecentTool = {
        id: toolId,
        name,
        href: toolHref,
        icon: Icon,
        timestamp: Date.now(),
      };

      setRecentTools(prev => {
        // Remove if already exists
        const filtered = prev.filter(t => t.id !== toolId);
        // Add to beginning
        const updated = [newTool, ...filtered].slice(0, MAX_RECENT_TOOLS);
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('tool-used' as any, handleToolUsage);
    return () => window.removeEventListener('tool-used' as any, handleToolUsage);
  }, []);

  const handleToolClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (recentTools.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-6 rtl:left-6 rtl:right-auto z-50 h-14 w-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-110 group",
          isOpen && "from-primary to-purple-600"
        )}
        size="icon"
      >
        <Zap className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
      </Button>

      {/* Quick Actions Menu */}
      {isOpen && (
        <Card className="fixed bottom-32 right-6 rtl:left-6 rtl:right-auto z-50 w-72 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {t("quickActions.recentTools")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {recentTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    variant="outline"
                    className="w-full justify-start hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 text-left rtl:text-right">
                        <p className="font-semibold text-sm">{t(tool.name)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("quickActions.used")} {formatTimeAgo(tool.timestamp)}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

