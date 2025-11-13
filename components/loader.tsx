"use client";

import { Sparkles } from "lucide-react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";

export function Loader() {
  const t = useTranslations();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 dark:bg-background/98 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8">
        {/* Logo with Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 dark:bg-primary/10 rounded-3xl blur-3xl animate-pulse" />
          <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 border-2 border-primary/30 dark:border-primary/20 shadow-2xl shadow-primary/30 dark:shadow-primary/10">
            <NextImage
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain animate-pulse"
            />
          </div>
        </div>
        
        {/* Spinning Rings */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 dark:border-primary/10 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" 
            style={{ animationDuration: "1s" }} 
          />
          <div 
            className="absolute inset-2 border-4 border-transparent border-r-primary/60 dark:border-primary/40 rounded-full animate-spin" 
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }} 
          />
          <div 
            className="absolute inset-4 border-4 border-transparent border-b-primary/40 dark:border-primary/30 rounded-full animate-spin" 
            style={{ animationDuration: "2s" }} 
          />
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-base font-semibold text-foreground animate-pulse">
            {t("common.loading") || "جاري التحميل..."}
          </span>
        </div>
        
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

