"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Moon, Sun, Globe, Save, Sparkles, Palette, Zap, Bell, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    defaultImageFormat: "png",
    defaultCompressionLevel: "medium",
    autoSave: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return null;

  const themeOptions = [
    { value: "light", label: "فاتح", icon: Sun, color: "from-yellow-500 to-orange-500" },
    { value: "dark", label: "داكن", icon: Moon, color: "from-indigo-500 to-purple-500" },
    { value: "system", label: "تلقائي", icon: Globe, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500/10 dark:bg-violet-500/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/3 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">{t("common.manageSettings")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent animate-pulse-glow flex items-center justify-center gap-2 sm:gap-3 px-4">
            <SettingsIcon className="h-8 w-8 sm:h-12 sm:w-12 text-violet-500" />
            {t("common.settings")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("common.manageSettings")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="shadow-2xl border-violet-200/50 dark:border-violet-800/50 bg-card/80 backdrop-blur-sm hover:shadow-violet-500/10 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("common.appearance")}</CardTitle>
                  <CardDescription>{t("common.chooseAppearance")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? `border-violet-500 bg-gradient-to-br ${option.color} text-white shadow-lg`
                          : "border-border hover:border-violet-500/50 bg-card/50"
                      }`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-3" />
                      <div className="font-bold text-lg">{option.label}</div>
                      {isActive && (
                        <div className="mt-2 text-sm opacity-90">{t("common.selected")}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Image Settings */}
          <Card className="shadow-2xl border-violet-200/50 dark:border-violet-800/50 bg-card/80 backdrop-blur-sm hover:shadow-violet-500/10 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("common.imageSettings")}</CardTitle>
                  <CardDescription>{t("common.defaultImageFormatDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  {t("common.defaultImageFormat")}
                </label>
                <select
                  value={settings.defaultImageFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultImageFormat: e.target.value })
                  }
                  className="w-full p-3 border-2 border-violet-200/50 dark:border-violet-800/50 rounded-xl bg-background/50 backdrop-blur-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="avif">AVIF</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="shadow-2xl border-violet-200/50 dark:border-violet-800/50 bg-card/80 backdrop-blur-sm hover:shadow-violet-500/10 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("common.generalSettings")}</CardTitle>
                  <CardDescription>{t("common.generalSettingsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-800/50">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-violet-500" />
                  <div>
                    <p className="font-semibold">{t("common.autoSave")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("common.autoSaveDesc")}
                    </p>
                  </div>
                </div>
                <Button
                  variant={settings.autoSave ? "default" : "outline"}
                  onClick={() =>
                    setSettings({ ...settings, autoSave: !settings.autoSave })
                  }
                  className={`transition-all duration-300 hover:scale-105 ${
                    settings.autoSave
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : ""
                  }`}
                >
                  {settings.autoSave ? t("common.enabled") : t("common.disabled")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              className={`gap-2 h-12 text-lg transition-all duration-300 hover:scale-105 ${
                saved
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              } shadow-lg hover:shadow-xl hover:shadow-violet-500/30`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  {t("common.saved")}!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t("common.saveSettings")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
