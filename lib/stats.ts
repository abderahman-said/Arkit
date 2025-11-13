// Statistics tracking system

export interface Stats {
  totalVisitors: number;
  totalUsers: number;
  totalImagesUploaded: number;
  totalFilesCompressed: number;
  totalOCRProcessed: number;
  totalConversions: number;
  lastUpdated: number;
}

const STATS_KEY = "app_stats";

export function getStats(): Stats {
  if (typeof window === "undefined") {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading stats:", error);
  }

  return getDefaultStats();
}

export function getDefaultStats(): Stats {
  return {
    totalVisitors: 0,
    totalUsers: 0,
    totalImagesUploaded: 0,
    totalFilesCompressed: 0,
    totalOCRProcessed: 0,
    totalConversions: 0,
    lastUpdated: Date.now(),
  };
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
}

export function incrementVisitor(): void {
  const stats = getStats();
  stats.totalVisitors += 1;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

export function incrementUser(): void {
  const stats = getStats();
  stats.totalUsers += 1;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

export function incrementImagesUploaded(count: number = 1): void {
  const stats = getStats();
  stats.totalImagesUploaded += count;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

export function incrementFilesCompressed(): void {
  const stats = getStats();
  stats.totalFilesCompressed += 1;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

export function incrementOCRProcessed(): void {
  const stats = getStats();
  stats.totalOCRProcessed += 1;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

export function incrementConversions(): void {
  const stats = getStats();
  stats.totalConversions += 1;
  stats.lastUpdated = Date.now();
  saveStats(stats);
}

// Track visitor on page load
if (typeof window !== "undefined") {
  // Only increment once per session
  const sessionKey = "visitor_tracked";
  if (!sessionStorage.getItem(sessionKey)) {
    incrementVisitor();
    sessionStorage.setItem(sessionKey, "true");
  }
}

