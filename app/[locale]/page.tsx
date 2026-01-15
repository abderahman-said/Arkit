"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  FileDown,
  ScanText,
  Search,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  Eye,
  Image as ImageIcon2,
  Archive,
  FileText,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getStats, getDefaultStats, incrementVisitor } from "@/lib/stats";
import { useSession } from "next-auth/react";
import { getPinnedTools, togglePinnedTool, isPinned } from "@/lib/pinned-tools";
import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState(getDefaultStats());
  const [pinnedTools, setPinnedTools] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPinnedTools(getPinnedTools());
    setStats(getStats());
  }, []);

  // Track visitor
  useEffect(() => {
    if (mounted) {
      incrementVisitor();
      const interval = setInterval(() => {
        setStats(getStats());
      }, 5000); // Update stats every 5 seconds

      return () => clearInterval(interval);
    }
  }, [mounted]);

  const tools = [
    {
      id: "image-converter",
      title: t("tools.imageConverter.title"),
      description: t("tools.imageConverter.description"),
      icon: ImageIcon,
      href: "/image-converter",
      color: "from-blue-500 to-cyan-500",
      category: "images",
      popular: true,
    },
    {
      id: "image-editor",
      title: t("imageEditor.title"),
      description: t("imageEditor.description"),
      icon: ScanText,
      href: "/image-editor",
      color: "from-purple-500 to-pink-500",
      category: "images",
      popular: true,
    },
    {
      id: "file-compressor",
      title: t("tools.fileCompressor.title"),
      description: t("tools.fileCompressor.description"),
      icon: FileDown,
      href: "/file-compressor",
      color: "from-purple-500 to-pink-500",
      category: "files",
      popular: true,
    },
    {
      id: "ocr",
      title: t("tools.ocr.title"),
      description: t("tools.ocr.description"),
      icon: ScanText,
      href: "/ocr",
      color: "from-green-500 to-emerald-500",
      category: "text",
      popular: false,
    },
  ];

  const filteredTools = useMemo(() => {
    let filtered = tools;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: pinned first, then popular, then others
    return filtered.sort((a, b) => {
      const aPinned = pinnedTools.includes(a.id);
      const bPinned = pinnedTools.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });
  }, [searchQuery, tools, pinnedTools]);

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const statsCards = [
    {
      title: t("stats.totalVisitors"),
      value: formatNumber(stats.totalVisitors),
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      change: "+12%",
    },
    {
      title: t("stats.registeredUsers"),
      value: formatNumber(stats.totalUsers + (session ? 1 : 0)),
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      change: "+8%",
    },
    {
      title: t("stats.imagesUploaded"),
      value: formatNumber(stats.totalImagesUploaded),
      icon: ImageIcon2,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
      change: "+24%",
    },
    {
      title: t("stats.filesCompressed"),
      value: formatNumber(stats.totalFilesCompressed),
      icon: Archive,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
      change: "+18%",
    },
    {
      title: t("stats.ocrProcessed"),
      value: formatNumber(stats.totalOCRProcessed),
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-500/10 to-purple-500/10",
      borderColor: "border-indigo-500/20",
      change: "+15%",
    },
    {
      title: t("stats.conversions"),
      value: formatNumber(stats.totalConversions),
      icon: Sparkles,
      color: "from-yellow-500 to-amber-500",
      bgColor: "from-yellow-500/10 to-amber-500/10",
      borderColor: "border-yellow-500/20",
      change: "+22%",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t("common.title"),
    "description": t("common.description"),
    "url": "https://toolshub.bg",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolshub.bg/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 dark:from-primary/2 dark:via-purple-500/1 dark:to-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 relative">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-4 sm:space-y-6 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-4">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-primary">{t("common.controlPanel")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse-glow px-4">
            {t("common.title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {t("common.description")}
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mb-8 sm:mb-12 slide-in-from-bottom-4" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{t("stats.statistics")}</h2>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              {t("common.updatedNow")}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgColor} border-2 ${stat.borderColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 slide-in-from-bottom-4`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{t("common.lastUpdate")}: {t("common.now")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 slide-in-from-bottom-4" style={{ animationDelay: "600ms" }}>
          <div className="relative">
            <Search className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 rtl:pr-12 rtl:pl-4 h-12 text-lg bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-4xl mx-auto px-4 slide-in-from-bottom-4" style={{ animationDelay: "700ms" }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tools.length}+</p>
                  <p className="text-sm text-muted-foreground">{t("common.availableTools")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">{t("common.alwaysAvailable")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Star className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">{t("common.free")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="mb-6 sm:mb-8 px-4 slide-in-from-bottom-4" style={{ animationDelay: "800ms" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{t("common.availableTools")}</h2>
              {pinnedTools.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 text-xs">
                  {pinnedTools.length} {t("common.pinned")}
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              {filteredTools.length} {t("common.toolsAvailable")}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            const isFavorite = favorites.includes(tool.id);
            return (
              <Card
                key={tool.id}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 slide-in-from-bottom-4"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Favorite Button */}
                <button
                  title="Add to favorites"
                  aria-label="Add to favorites"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(tool.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`h-4 w-4 transition-all duration-200 ${isFavorite
                      ? "fill-yellow-500 text-yellow-500 scale-110"
                      : "text-muted-foreground group-hover:text-yellow-500"
                      }`}
                  />
                </button>

                <CardHeader className="relative z-10">
                  <div className="flex items-start gap-4 mb-2">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                        {tool.popular && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            شائع
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePinnedTool(tool.id);
                        setPinnedTools(getPinnedTools());
                      }}
                      className={cn(
                        "h-9 w-9 hover:bg-primary/10",
                        isPinned(tool.id) && "text-primary"
                      )}
                    >
                      {isPinned(tool.id) ? (
                        <Pin className="h-4 w-4 fill-current" />
                      ) : (
                        <PinOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Link
                      href={tool.href}
                      className="flex-1"
                      onClick={() => {
                        // Save to history
                        const history = JSON.parse(localStorage.getItem("toolHistory") || "[]");
                        const newItem = {
                          id: Date.now().toString(),
                          toolId: tool.id,
                          toolName: tool.title,
                          timestamp: Date.now(),
                          href: tool.href,
                        };
                        const updatedHistory = [newItem, ...history.filter((h: { toolId: string; }) => h.toolId !== tool.id)].slice(0, 10);
                        localStorage.setItem("toolHistory", JSON.stringify(updatedHistory));
                      }}
                    >
                      <Button className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105">
                        <span className="relative z-10 flex items-center gap-2">
                          {t("common.useTool")}
                          <ArrowUpRight className="h-4  w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform  rtl:scale-x-[-1] " />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-lg transition-all duration-300 pointer-events-none" />
              </Card>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 fade-in-0">
            <p className="text-muted-foreground text-lg">{t("common.noToolsFound")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
