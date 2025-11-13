"use client";

interface ToolSettings {
  [toolId: string]: Record<string, unknown>;
}

const STORAGE_KEY = "tool_settings";

export function getToolSettings(toolId: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allSettings: ToolSettings = JSON.parse(stored);
      return allSettings[toolId] || {};
    }
  } catch (error) {
    console.error("Failed to load tool settings", error);
  }
  
  return {};
}

export function saveToolSettings(toolId: string, settings: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allSettings: ToolSettings = stored ? JSON.parse(stored) : {};
    allSettings[toolId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error("Failed to save tool settings", error);
  }
}

export function clearToolSettings(toolId?: string): void {
  if (typeof window === "undefined") return;
  
  try {
    if (toolId) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allSettings: ToolSettings = JSON.parse(stored);
        delete allSettings[toolId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to clear tool settings", error);
  }
}

