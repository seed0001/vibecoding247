"use client";

const KEY = "vc247-first-steps-visited";

export function getVisitedLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function markLessonVisited(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const visited = getVisitedLessons();
    if (!visited.includes(slug)) {
      window.localStorage.setItem(KEY, JSON.stringify([...visited, slug]));
    }
  } catch {
    // storage unavailable (private mode etc.) — progress is a nicety, not a requirement
  }
}
