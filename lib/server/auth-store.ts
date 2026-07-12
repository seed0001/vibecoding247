import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { rename, writeFile } from "fs/promises";
import { join } from "path";

/**
 * File-backed accounts + sessions. Same persistence strategy as the
 * stats store: /data Railway volume when present, .stats/ locally.
 * Handles only (no email) — minimal PII by design; kids visit this site.
 *
 * Sessions are written to sessions.json so the WebSocket server
 * (server.mjs, plain Node) can authenticate connections by reading it.
 */

export interface User {
  id: string;
  handle: string;
  passHash: string;
  salt: string;
  color: string;
  createdAt: number;
}

export interface PublicUser {
  id: string;
  handle: string;
  color: string;
}

interface AuthStore {
  users: Map<string, User>; // by id
  handles: Map<string, string>; // lower(handle) -> id
  sessions: Map<string, { userId: string; expires: number }>; // token -> session
  dir: string | null;
  saveTimer: ReturnType<typeof setTimeout> | null;
}

export const SESSION_COOKIE = "vc247_session";
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const SAVE_DEBOUNCE_MS = 1500;

export const ORB_COLORS = [
  "#818cf8",
  "#22d3ee",
  "#4ade80",
  "#fbbf24",
  "#fb7185",
  "#e879f9",
  "#f97316",
  "#f4f4f5",
];

function resolveDir(): string | null {
  const candidates = [
    process.env.STATS_DIR,
    "/data",
    join(process.cwd(), ".stats"),
  ].filter(Boolean) as string[];
  for (const dir of candidates) {
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      continue;
    }
  }
  return null;
}

function createStore(): AuthStore {
  const dir = resolveDir();
  const store: AuthStore = {
    users: new Map(),
    handles: new Map(),
    sessions: new Map(),
    dir,
    saveTimer: null,
  };
  if (dir) {
    try {
      const users: User[] = JSON.parse(
        readFileSync(join(dir, "users.json"), "utf8"),
      );
      for (const u of users) {
        store.users.set(u.id, u);
        store.handles.set(u.handle.toLowerCase(), u.id);
      }
    } catch {
      /* first boot */
    }
    try {
      const sessions: Record<string, { userId: string; expires: number }> =
        JSON.parse(readFileSync(join(dir, "sessions.json"), "utf8"));
      const now = Date.now();
      for (const [token, s] of Object.entries(sessions)) {
        if (s.expires > now) store.sessions.set(token, s);
      }
    } catch {
      /* first boot */
    }
  }
  return store;
}

const g = globalThis as unknown as { __vc247Auth?: AuthStore };
const store = (g.__vc247Auth ??= createStore());

function scheduleSave() {
  if (!store.dir || store.saveTimer) return;
  store.saveTimer = setTimeout(() => {
    store.saveTimer = null;
    const dir = store.dir!;
    const writeJson = async (file: string, data: unknown) => {
      const path = join(dir, file);
      const tmp = `${path}.tmp`;
      await writeFile(tmp, JSON.stringify(data), "utf8");
      await rename(tmp, path);
    };
    void writeJson("users.json", [...store.users.values()]).catch(() => {});
    void writeJson(
      "sessions.json",
      Object.fromEntries(store.sessions),
    ).catch(() => {});
  }, SAVE_DEBOUNCE_MS);
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function validateHandle(handle: string): string | null {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(handle)) {
    return "Handle must be 3–20 letters, numbers, or underscores.";
  }
  return null;
}

export function signup(
  handle: string,
  password: string,
  color: string,
): { user?: PublicUser; token?: string; error?: string } {
  const handleError = validateHandle(handle);
  if (handleError) return { error: handleError };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (store.handles.has(handle.toLowerCase())) {
    return { error: "That handle is taken." };
  }
  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: randomBytes(9).toString("hex"),
    handle,
    passHash: hashPassword(password, salt),
    salt,
    color: ORB_COLORS.includes(color) ? color : ORB_COLORS[0],
    createdAt: Date.now(),
  };
  store.users.set(user.id, user);
  store.handles.set(handle.toLowerCase(), user.id);
  const token = createSession(user.id);
  scheduleSave();
  return { user: publicUser(user), token };
}

export function login(
  handle: string,
  password: string,
): { user?: PublicUser; token?: string; error?: string } {
  const id = store.handles.get(handle.toLowerCase());
  const user = id ? store.users.get(id) : undefined;
  if (!user) return { error: "No account with that handle." };
  const attempt = Buffer.from(hashPassword(password, user.salt), "hex");
  const actual = Buffer.from(user.passHash, "hex");
  if (attempt.length !== actual.length || !timingSafeEqual(attempt, actual)) {
    return { error: "Wrong password." };
  }
  const token = createSession(user.id);
  scheduleSave();
  return { user: publicUser(user), token };
}

function createSession(userId: string): string {
  const token = randomBytes(24).toString("hex");
  store.sessions.set(token, {
    userId,
    expires: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function logout(token: string) {
  store.sessions.delete(token);
  scheduleSave();
}

export function getUserByToken(token: string | undefined): PublicUser | null {
  if (!token) return null;
  const session = store.sessions.get(token);
  if (!session || session.expires < Date.now()) return null;
  const user = store.users.get(session.userId);
  return user ? publicUser(user) : null;
}

export function setColor(token: string | undefined, color: string): PublicUser | null {
  if (!token || !ORB_COLORS.includes(color)) return null;
  const session = store.sessions.get(token);
  if (!session || session.expires < Date.now()) return null;
  const user = store.users.get(session.userId);
  if (!user) return null;
  user.color = color;
  scheduleSave();
  return publicUser(user);
}

function publicUser(u: User): PublicUser {
  return { id: u.id, handle: u.handle, color: u.color };
}

export function readTokenFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === SESSION_COOKIE) return rest.join("=");
  }
  return undefined;
}
