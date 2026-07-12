import { existsSync, mkdirSync, readFileSync } from "fs";
import { rename, writeFile } from "fs/promises";
import { join } from "path";

/**
 * Site-wide stats: total visits, live sessions, accumulated time.
 *
 * Lives in server memory and persists to a JSON file. On Railway,
 * attach a volume mounted at /data (or set STATS_DIR) so the totals
 * survive deploys; without one they reset when the container does.
 * Single-instance by design — matches the current Railway setup.
 */

interface PersistedStats {
  totalVisits: number;
  totalSeconds: number;
}

interface StatsStore {
  totalVisits: number;
  totalSeconds: number;
  /** session id → last-seen epoch ms */
  sessions: Map<string, number>;
  file: string | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
}

const ACTIVE_WINDOW_MS = 75_000;
const PRUNE_AFTER_MS = 5 * 60_000;
const MAX_HEARTBEAT_SECONDS = 120;
const SAVE_DEBOUNCE_MS = 10_000;

function resolveStatsFile(): string | null {
  const candidates = [
    process.env.STATS_DIR,
    "/data",
    join(process.cwd(), ".stats"),
  ].filter(Boolean) as string[];
  for (const dir of candidates) {
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      return join(dir, "site-stats.json");
    } catch {
      continue;
    }
  }
  return null;
}

function createStore(): StatsStore {
  const file = resolveStatsFile();
  let persisted: PersistedStats = { totalVisits: 0, totalSeconds: 0 };
  if (file && existsSync(file)) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf8"));
      persisted = {
        totalVisits: Number(raw.totalVisits) || 0,
        totalSeconds: Number(raw.totalSeconds) || 0,
      };
    } catch {
      /* corrupted file — start fresh rather than crash */
    }
  }
  return {
    totalVisits: persisted.totalVisits,
    totalSeconds: persisted.totalSeconds,
    sessions: new Map(),
    file,
    saveTimer: null,
  };
}

// survive dev HMR and route-handler module duplication
const globalStats = globalThis as unknown as { __vc247Stats?: StatsStore };
const store = (globalStats.__vc247Stats ??= createStore());

function scheduleSave() {
  if (!store.file || store.saveTimer) return;
  store.saveTimer = setTimeout(() => {
    store.saveTimer = null;
    const file = store.file!;
    const tmp = `${file}.tmp`;
    const body = JSON.stringify({
      totalVisits: store.totalVisits,
      totalSeconds: store.totalSeconds,
    });
    writeFile(tmp, body, "utf8")
      .then(() => rename(tmp, file))
      .catch(() => {
        /* persistence is best-effort */
      });
  }, SAVE_DEBOUNCE_MS);
}

function pruneSessions(now: number) {
  for (const [id, lastSeen] of store.sessions) {
    if (now - lastSeen > PRUNE_AFTER_MS) store.sessions.delete(id);
  }
}

export interface SiteStats {
  totalVisits: number;
  activeNow: number;
  totalSeconds: number;
}

export function getStats(): SiteStats {
  const now = Date.now();
  pruneSessions(now);
  let active = 0;
  for (const lastSeen of store.sessions.values()) {
    if (now - lastSeen <= ACTIVE_WINDOW_MS) active += 1;
  }
  return {
    totalVisits: store.totalVisits,
    activeNow: active,
    totalSeconds: Math.round(store.totalSeconds),
  };
}

export function recordVisit(sessionId: string): SiteStats {
  const now = Date.now();
  if (!store.sessions.has(sessionId)) {
    store.totalVisits += 1;
    scheduleSave();
  }
  store.sessions.set(sessionId, now);
  return getStats();
}

export function recordHeartbeat(sessionId: string, seconds: number): SiteStats {
  const now = Date.now();
  store.sessions.set(sessionId, now);
  const delta = Math.min(Math.max(seconds, 0), MAX_HEARTBEAT_SECONDS);
  if (delta > 0) {
    store.totalSeconds += delta;
    scheduleSave();
  }
  return getStats();
}
