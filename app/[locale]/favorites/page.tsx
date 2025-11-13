"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ImageIcon, FileDown, ScanText, Sparkles, Heart, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";

export default function FavoritesPage() {
  const t = useTranslations();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const tools = [
    {
      id: "image-converter",
      title: t("tools.imageConverter.title"),
      description: t("tools.imageConverter.description"),
      icon: ImageIcon,
      href: "/image-converter",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "file-compressor",
      title: t("tools.fileCompressor.title"),
      description: t("tools.fileCompressor.description"),
      icon: FileDown,
      href: "/file-compressor",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "ocr",
      title: t("tools.ocr.title"),
      description: t("tools.ocr.description"),
      icon: ScanText,
      href: "/ocr",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));

  const removeFavorite = (toolId: string) => {
    const newFavorites = favorites.filter((id) => id !== toolId);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-500/10 dark:bg-yellow-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400">{t("common.favorites")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent animate-pulse-glow flex items-center justify-center gap-2 sm:gap-3 px-4">
            <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 animate-pulse" />
            {t("common.favorites")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {favoriteTools.length === 0
              ? t("common.noFavorites") + " - " + t("common.addFavorites")
              : `${favoriteTools.length} ${t("common.favorites")}`}
          </p>
        </div>

        {favoriteTools.length === 0 ? (
          <Card className="shadow-2xl border-yellow-200/50 dark:border-yellow-800/50 bg-card/80 backdrop-blur-sm p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Star className="h-16 w-16 text-yellow-500/50" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("common.noFavorites")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {t("common.addFavorites")}
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-105">
                    <Sparkles className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    {t("common.backToHome")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="group relative overflow-hidden shadow-xl border-yellow-200/50 dark:border-yellow-800/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 hover:scale-105 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(tool.id)}
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Link href={tool.href}>
                      <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden">
                        <span className="relative z-10">{t("common.useTool")}</span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                      </Button>
                    </Link>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-yellow-500/0 group-hover:border-yellow-500/20 rounded-lg transition-all duration-300 pointer-events-none" />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
