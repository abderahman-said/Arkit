"use client";

import { Shield, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PrivacyBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PrivacyBadge({ className, variant = "default" }: PrivacyBadgeProps) {
  const t = useTranslations();

  if (variant === "compact") {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium",
        className
      )}>
        <Lock className="h-3 w-3" />
        <span>{t("privacy.local")}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 shadow-lg backdrop-blur-sm",
      className
    )}>
      <div className="p-1.5 rounded-lg bg-green-500/20">
        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
          {t("privacy.title")}
        </span>
        <span className="text-xs text-green-600/80 dark:text-green-400/80">
          {t("privacy.description")}
        </span>
      </div>
    </div>
  );
}

