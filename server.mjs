/**
 * Custom server: Next.js + a WebSocket presence/chat layer on the same
 * port (Railway serves one port). Rooms are route pathnames; everyone
 * signed in appears as a glowing orb to everyone else in the same room.
 *
 * Auth: route handlers write sessions.json / users.json (see
 * lib/server/auth-store.ts); this server reads them to authenticate
 * socket connections — no shared runtime needed.
 */

import { createServer } from "http";
import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";
import next from "next";
import { WebSocketServer } from "ws";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

/* ---------------- auth file readers (with mtime caching) ------------ */

function resolveDataDir() {
  const candidates = [
    process.env.STATS_DIR,
    "/data",
    join(process.cwd(), ".stats"),
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

const fileCache = new Map(); // path -> { mtime, data }

function readJsonCached(path, fallback) {
  try {
    const mtime = statSync(path).mtimeMs;
    const cached = fileCache.get(path);
    if (cached && cached.mtime === mtime) return cached.data;
    const data = JSON.parse(readFileSync(path, "utf8"));
    fileCache.set(path, { mtime, data });
    return data;
  } catch {
    return fallback;
  }
}

function authenticate(cookieHeader) {
  if (!cookieHeader) return null;
  let token;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === "vc247_session") token = rest.join("=");
  }
  if (!token) return null;
  const dir = resolveDataDir();
  if (!dir) return null;
  const sessions = readJsonCached(join(dir, "sessions.json"), {});
  const session = sessions[token];
  if (!session || session.expires < Date.now()) return null;
  const users = readJsonCached(join(dir, "users.json"), []);
  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { id: user.id, handle: user.handle, color: user.color };
}

/* ---------------- presence rooms ------------------------------------ */

/** room -> Map<connId, { ws, user, pos, lastChat }> */
const rooms = new Map();
let nextConnId = 1;

function joinRoom(room, conn) {
  if (!rooms.has(room)) rooms.set(room, new Map());
  rooms.get(room).set(conn.id, conn);
}

function leaveRoom(conn) {
  const members = rooms.get(conn.room);
  if (!members) return;
  members.delete(conn.id);
  if (members.size === 0) rooms.delete(conn.room);
  else broadcast(conn.room, { type: "leave", id: conn.id });
}

function broadcast(room, message, exceptId) {
  const members = rooms.get(room);
  if (!members) return;
  const data = JSON.stringify(message);
  for (const [id, member] of members) {
    if (id === exceptId) continue;
    if (member.ws.readyState === 1) member.ws.send(data);
  }
}

function rosterFor(room, exceptId) {
  const members = rooms.get(room);
  if (!members) return [];
  const peers = [];
  for (const [id, member] of members) {
    if (id === exceptId) continue;
    peers.push({
      id,
      handle: member.user.handle,
      color: member.user.color,
      pos: member.pos,
    });
  }
  return peers;
}

const VALID_ROOM = /^[a-z0-9\-\/]{1,64}$/;

function handleSocket(ws, user) {
  const conn = {
    id: `c${nextConnId++}`,
    ws,
    user,
    room: null,
    pos: [0, 0, 0, 0], // x, y, z, yaw
    lastChat: 0,
  };

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg.type === "join" && typeof msg.room === "string") {
      const room = msg.room.toLowerCase();
      if (!VALID_ROOM.test(room)) return;
      if (conn.room) leaveRoom(conn);
      conn.room = room;
      joinRoom(room, conn);
      ws.send(
        JSON.stringify({
          type: "welcome",
          selfId: conn.id,
          peers: rosterFor(room, conn.id),
        }),
      );
      broadcast(
        room,
        {
          type: "enter",
          id: conn.id,
          handle: user.handle,
          color: user.color,
          pos: conn.pos,
        },
        conn.id,
      );
    } else if (msg.type === "pos" && conn.room && Array.isArray(msg.pos)) {
      const pos = msg.pos.slice(0, 4).map((n) => {
        const v = Number(n);
        return Number.isFinite(v) ? Math.max(-2000, Math.min(2000, v)) : 0;
      });
      conn.pos = pos;
      broadcast(conn.room, { type: "pos", id: conn.id, pos }, conn.id);
    } else if (msg.type === "chat" && conn.room && typeof msg.text === "string") {
      const now = Date.now();
      if (now - conn.lastChat < 800) return; // rate limit
      const text = msg.text.trim().slice(0, 280);
      if (!text) return;
      conn.lastChat = now;
      broadcast(conn.room, {
        type: "chat",
        id: conn.id,
        handle: user.handle,
        color: user.color,
        text,
        ts: now,
      });
    }
  });

  ws.on("close", () => leaveRoom(conn));
  ws.on("error", () => leaveRoom(conn));
}

/* ---------------- boot ---------------------------------------------- */

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (pathname !== "/ws") {
      // let Next's own HMR websocket (dev) or anything else pass through
      if (dev) return;
      socket.destroy();
      return;
    }
    const user = authenticate(req.headers.cookie ?? null);
    if (!user) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => handleSocket(ws, user));
  });

  server.listen(port, () => {
    console.log(
      `vibecoding247 ready on :${port} (presence: /ws, ${dev ? "dev" : "prod"})`,
    );
  });
});
