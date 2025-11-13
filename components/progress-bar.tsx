"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  progress,
  className,
  showLabel = true,
  label,
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">{label || "جاري المعالجة..."}</span>
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="relative w-full h-3 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden shadow-lg"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-blue-400/50 blur-sm" />
          
          {/* Animated dots */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
        </div>
        
        {/* Progress indicator */}
        {progress > 0 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `calc(${progress}% - 8px)` }}
          >
            <div className="w-4 h-4 rounded-full bg-white border-2 border-purple-500 shadow-lg animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Progress steps */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn("transition-colors", progress >= 0 && "text-purple-600 dark:text-purple-400 font-medium")}>
          بدء
        </span>
        <span className={cn("transition-colors", progress >= 50 && "text-blue-600 dark:text-blue-400 font-medium")}>
          معالجة
        </span>
        <span className={cn("transition-colors", progress >= 100 && "text-green-600 dark:text-green-400 font-medium")}>
          اكتمال
        </span>
      </div>
    </div>
  );
}

