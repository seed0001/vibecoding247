"use client";

import { useEffect, useState } from "react";

export interface SiteStatsView {
  totalVisits: number;
  activeNow: number;
  totalSeconds: number;
  realmsCurrent: number;
}

const HEARTBEAT_MS = 25_000;

function sessionId(): string {
  try {
    const KEY = "vc247-session";
    let id = window.sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Registers this visit, heartbeats while the tab is visible (which is
 * what accumulates "total time explored" server-side), and returns
 * live site stats for the Nexus board.
 */
export function useSiteStats(): SiteStatsView | null {
  const [stats, setStats] = useState<SiteStatsView | null>(null);

  useEffect(() => {
    const id = sessionId();
    let disposed = false;
    let lastBeat = Date.now();

    const apply = (data: unknown) => {
      if (disposed || !data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      setStats({
        totalVisits: Number(d.totalVisits) || 0,
        activeNow: Number(d.activeNow) || 0,
        totalSeconds: Number(d.totalSeconds) || 0,
        realmsCurrent: Number(d.realmsCurrent) || 0,
      });
    };

    const post = async (path: string, body: object) => {
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) apply(await res.json());
      } catch {
        /* offline / transient — next beat will catch up */
      }
    };

    void post("/api/stats/visit", { id });

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      const seconds = Math.round((now - lastBeat) / 1000);
      lastBeat = now;
      void post("/api/stats/heartbeat", { id, seconds });
    };
    const interval = setInterval(beat, HEARTBEAT_MS);

    const onVisibility = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        // flush the tail of this stretch; sendBeacon survives tab close
        const seconds = Math.round((now - lastBeat) / 1000);
        lastBeat = now;
        try {
          navigator.sendBeacon(
            "/api/stats/heartbeat",
            JSON.stringify({ id, seconds }),
          );
        } catch {
          /* best-effort */
        }
      } else {
        // returning to the tab — don't count the time away
        lastBeat = now;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return stats;
}

export function formatDuration(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86_400);
  const h = Math.floor((totalSeconds % 86_400) / 3_600);
  const m = Math.floor((totalSeconds % 3_600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (d > 0) return `${d}D ${h}H ${m}M`;
  if (h > 0) return `${h}H ${m}M ${s}S`;
  return `${m}M ${s}S`;
}

export function formatCounter(n: number, width = 6): string {
  return String(Math.max(0, Math.floor(n))).padStart(width, "0");
}
