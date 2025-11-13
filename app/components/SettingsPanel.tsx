"use client";

import { useSettings } from "../providers/SettingsProvider";
import React, { useRef } from "react";

type Preset = {
  name: string;
  values: Partial<ReturnType<typeof useSettings>["settings"]>;
};

const PRESETS: Preset[] = [
  {
    name: "Minimal Light",
    values: { theme: "light", primary: "#111827", radius: 8, spacingScale: 1, fontSizeScale: 1, lineHeightScale: 1.3, containerLayout: "boxed", containerWidth: 1024 },
  },
  {
    name: "Modern Dark",
    values: { theme: "dark", primary: "#22c55e", radius: 14, spacingScale: 1.1, fontSizeScale: 1.05, lineHeightScale: 1.4, containerLayout: "boxed", containerWidth: 1120 },
  },
  {
    name: "Playful",
    values: { theme: "light", primary: "#f43f5e", radius: 20, spacingScale: 1.2, fontSizeScale: 1.1, lineHeightScale: 1.35, containerLayout: "fluid" },
  },
  {
    name: "Corporate",
    values: { theme: "light", primary: "#0ea5e9", radius: 10, spacingScale: 1, fontSizeScale: 0.98, lineHeightScale: 1.35, containerLayout: "boxed", containerWidth: 1200 },
  },
  {
    name: "Neon",
    values: { theme: "dark", primary: "#a78bfa", radius: 16, spacingScale: 1.15, fontSizeScale: 1.08, lineHeightScale: 1.4, containerLayout: "fluid" },
  },
  {
    name: "Pastel",
    values: { theme: "light", primary: "#60a5fa", radius: 18, spacingScale: 1.1, fontSizeScale: 1.06, lineHeightScale: 1.45, containerLayout: "boxed", containerWidth: 1080 },
  },
];

export function SettingsPanel() {
  const { settings, update, reset, setSettings, cloudEnabled, setCloudEnabled, cloudStatus } = useSettings();
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="ui-card w-full rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-scale-lg font-semibold">Design System Playground</h2>
        <button
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={reset}
        >
          Reset
        </button>
      </div>

      {/* Cloud Sync */}
      <div className="mb-3 flex items-center justify-between rounded-md border border-zinc-200 bg-white/60 p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <input id="cloud-toggle" type="checkbox" checked={cloudEnabled} onChange={(e) => setCloudEnabled(e.target.checked)} />
          <label htmlFor="cloud-toggle">Cloud Sync</label>
        </div>
        <span className="text-xs text-zinc-500">{cloudEnabled ? cloudStatus : "off"}</span>
      </div>

      {/* Presets */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setSettings({ ...settings, ...p.values })}
            className="truncate rounded-md border border-zinc-300 px-2 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title={p.name}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Theme */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Theme</label>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((m) => (
              <button
                key={m}
                onClick={() => update("theme", m)}
                className={`rounded-md px-3 py-1.5 text-sm border ${
                  settings.theme === m
                    ? "border-zinc-900 dark:border-zinc-100"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Primary color */
        }
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Primary Color</label>
          <input
            type="color"
            value={settings.primary}
            onChange={(e) => update("primary", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-md border border-zinc-300 bg-transparent dark:border-zinc-700"
            aria-label="Primary color"
          />
        </fieldset>

        {/* Success color */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Success Color</label>
          <input
            type="color"
            value={settings.success}
            onChange={(e) => update("success", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-md border border-zinc-300 bg-transparent dark:border-zinc-700"
            aria-label="Success color"
          />
        </fieldset>

        {/* Warning color */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Warning Color</label>
          <input
            type="color"
            value={settings.warning}
            onChange={(e) => update("warning", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-md border border-zinc-300 bg-transparent dark:border-zinc-700"
            aria-label="Warning color"
          />
        </fieldset>

        {/* Neutral color */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Neutral Color</label>
          <input
            type="color"
            value={settings.neutral}
            onChange={(e) => update("neutral", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-md border border-zinc-300 bg-transparent dark:border-zinc-700"
            aria-label="Neutral color"
          />
        </fieldset>

        {/* Radius */}
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Radius</span>
            <span className="tabular-nums text-zinc-500">{settings.radius}px</span>
          </label>
          <input
            type="range"
            min={0}
            max={24}
            step={1}
            value={settings.radius}
            onChange={(e) => update("radius", Number(e.target.value))}
            className="w-full"
          />
        </fieldset>

        {/* Spacing scale */}
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Spacing Scale</span>
            <span className="tabular-nums text-zinc-500">×{settings.spacingScale.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0.75}
            max={1.5}
            step={0.05}
            value={settings.spacingScale}
            onChange={(e) => update("spacingScale", Number(e.target.value))}
            className="w-full"
          />
        </fieldset>

        {/* Font size scale */}
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Font Size Scale</span>
            <span className="tabular-nums text-zinc-500">×{settings.fontSizeScale.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0.85}
            max={1.4}
            step={0.05}
            value={settings.fontSizeScale}
            onChange={(e) => update("fontSizeScale", Number(e.target.value))}
            className="w-full"
          />
        </fieldset>

        {/* Line height scale */}
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Line Height Scale</span>
            <span className="tabular-nums text-zinc-500">×{settings.lineHeightScale.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={1.6}
            step={0.05}
            value={settings.lineHeightScale}
            onChange={(e) => update("lineHeightScale", Number(e.target.value))}
            className="w-full"
          />
        </fieldset>

        {/* Container layout */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Layout</label>
          <div className="flex gap-2">
            {(["boxed", "fluid"] as const).map((m) => (
              <button
                key={m}
                onClick={() => update("containerLayout", m)}
                className={`rounded-md px-3 py-1.5 text-sm border ${
                  settings.containerLayout === m
                    ? "border-zinc-900 dark:border-zinc-100"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Container width */}
        {settings.containerLayout === "boxed" && (
          <fieldset className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium">
              <span>Container Width</span>
              <span className="tabular-nums text-zinc-500">{settings.containerWidth}px</span>
            </label>
            <input
              type="range"
              min={800}
              max={1440}
              step={10}
              value={settings.containerWidth}
              onChange={(e) => update("containerWidth", Number(e.target.value))}
              className="w-full"
            />
          </fieldset>
        )}

        {/* Font family */}
        <fieldset className="space-y-2">
          <label className="text-sm font-medium">Typography</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value as any)}
            className="h-9 w-full rounded-md border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"
          >
            <option value="system">System Sans</option>
            <option value="geist">Geist Sans</option>
            <option value="mono">Mono</option>
          </select>
        </fieldset>
      </div>

      {/* Grid controls */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Grid Columns</span>
            <span className="tabular-nums text-zinc-500">{settings.gridColumns}</span>
          </label>
          <input
            type="range"
            min={2}
            max={24}
            step={1}
            value={settings.gridColumns}
            onChange={(e) => update("gridColumns", Number(e.target.value))}
            className="w-full"
            aria-label="Grid columns"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium">
            <span>Grid Gutter</span>
            <span className="tabular-nums text-zinc-500">{settings.gridGutter}px</span>
          </label>
          <input
            type="range"
            min={0}
            max={48}
            step={2}
            value={settings.gridGutter}
            onChange={(e) => update("gridGutter", Number(e.target.value))}
            className="w-full"
            aria-label="Grid gutter"
          />
        </fieldset>
      </div>

      {/* Share link */}
      <div className="mt-3 flex items-center gap-2">
        <button
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={() => {
            try {
              const href = window.location.href;
              navigator.clipboard.writeText(href);
            } catch {}
          }}
        >
          Copy Link
        </button>
      </div>

      {/* Export / Import */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={() => {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "ui-settings.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export JSON
        </button>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                setSettings({ ...settings, ...parsed });
              } catch {}
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <button
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
        </div>
      </div>
    </div>
  );
}


