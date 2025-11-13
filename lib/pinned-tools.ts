"use client";

const STORAGE_KEY = "pinned_tools";

export function getPinnedTools(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load pinned tools", error);
  }
  
  return [];
}

export function togglePinnedTool(toolId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const pinned = getPinnedTools();
    const index = pinned.indexOf(toolId);
    
    if (index > -1) {
      pinned.splice(index, 1);
    } else {
      pinned.push(toolId);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned));
  } catch (error) {
    console.error("Failed to toggle pinned tool", error);
  }
}

export function isPinned(toolId: string): boolean {
  return getPinnedTools().includes(toolId);
}

