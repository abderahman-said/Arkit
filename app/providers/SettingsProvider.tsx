"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCloudSync } from "../lib/cloudSync";

type ThemeMode = "light" | "dark" | "system";
type ContainerLayout = "boxed" | "fluid";

export type UISettings = {
  theme: ThemeMode;
  primary: string;
  success: string;
  warning: string;
  neutral: string;
  radius: number; // px
  spacingScale: number; // multiplier
  fontSizeScale: number; // multiplier
  lineHeightScale: number; // multiplier
  containerLayout: ContainerLayout;
  containerWidth: number; // px for boxed
  fontFamily: "system" | "geist" | "mono";
  gridColumns: number;
  gridGutter: number; // px
};

const defaultSettings: UISettings = {
  theme: "system",
  primary: "#3b82f6",
  success: "#16a34a",
  warning: "#f59e0b",
  neutral: "#64748b",
  radius: 12,
  spacingScale: 1,
  fontSizeScale: 1,
  lineHeightScale: 1.1,
  containerLayout: "boxed",
  containerWidth: 1100,
  fontFamily: "geist",
  gridColumns: 12,
  gridGutter: 16,
};

type SettingsContextValue = {
  settings: UISettings;
  setSettings: (next: UISettings) => void;
  update: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void;
  reset: () => void;
  cloudEnabled: boolean;
  setCloudEnabled: (v: boolean) => void;
  cloudStatus: "connected" | "unavailable" | "idle";
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEY = "configurable-ui-settings-v1";
const CLOUD_KEY = "configurable-ui-cloud-enabled";

function applyCssVariables(settings: UISettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", settings.primary);
  root.style.setProperty("--success", settings.success);
  root.style.setProperty("--warning", settings.warning);
  root.style.setProperty("--neutral", settings.neutral);
  root.style.setProperty("--radius", `${settings.radius}px`);
  root.style.setProperty("--spacing-scale", String(settings.spacingScale));
  root.style.setProperty("--font-size-scale", String(settings.fontSizeScale));
  root.style.setProperty("--line-height-scale", String(settings.lineHeightScale));
  root.style.setProperty("--container-width", `${settings.containerWidth}px`);
  root.style.setProperty("--grid-columns", String(settings.gridColumns));
  root.style.setProperty("--grid-gutter", `${settings.gridGutter}px`);

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = settings.theme === "dark" || (settings.theme === "system" && prefersDark);
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  switch (settings.fontFamily) {
    case "geist":
      root.style.setProperty("--font-geist-active", "1");
      break;
    case "mono":
      root.style.setProperty("--font-geist-active", "0");
      break;
    default:
      root.style.setProperty("--font-geist-active", "0");
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UISettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<"connected" | "unavailable" | "idle">("idle");
  const [cloud, setCloud] = useState<null | Awaited<ReturnType<typeof getCloudSync>>>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UISettings>;
        const merged = { ...defaultSettings, ...parsed } as UISettings;
        setSettings(merged);
        applyCssVariables(merged);
      } else {
        applyCssVariables(defaultSettings);
      }
      const cloudRaw = localStorage.getItem(CLOUD_KEY);
      if (cloudRaw) setCloudEnabled(cloudRaw === "1");
    } catch {
      applyCssVariables(defaultSettings);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist and apply changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
    applyCssVariables(settings);
  }, [settings, isHydrated]);

  // Persist cloud toggle
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CLOUD_KEY, cloudEnabled ? "1" : "0");
    } catch {}
  }, [cloudEnabled, isHydrated]);

  // Initialize cloud impl lazily
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const impl = await getCloudSync();
      if (cancelled) return;
      setCloud(impl);
      setCloudStatus(impl.status());
      if (cloudEnabled && impl.available) {
        await impl.connect({});
        setCloudStatus(impl.status());
        const unsub = impl.subscribe((data) => {
          if (!data || typeof data !== "object") return;
          setSettings((prev) => ({ ...prev, ...(data as Partial<UISettings>) }));
        });
        return () => {
          unsub();
        };
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled]);

  // Save to cloud when settings change
  useEffect(() => {
    if (!cloudEnabled || !cloud || !cloud.available) return;
    const id = setTimeout(() => {
      cloud.save(settings).catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [settings, cloudEnabled, cloud]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setSettings,
      update: (key, value) => setSettings((prev) => ({ ...prev, [key]: value })),
      reset: () => setSettings(defaultSettings),
      cloudEnabled,
      setCloudEnabled,
      cloudStatus,
    }),
    [settings, cloudEnabled, cloudStatus]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}


