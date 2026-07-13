# Architecture — Vibe Coding 24/7

> Technical overview: stack, structure, and the decisions behind them.
> Last updated: 2026-07-13.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.10 (App Router) — **breaking changes vs. older Next; read `node_modules/next/dist/docs/` before coding** |
| 3D | three.js via @react-three/fiber + drei |
| Server | Custom Node entry `server.mjs` wrapping Next + a WebSocket layer (`/ws`) on the same port |
| Realtime voice | WebRTC mesh (STUN only), spatialized with WebAudio PannerNodes |
| Persistence | JSON files on a Railway volume mounted at `/data` (stats, users, sessions) — no database yet |
| Hosting | Railway; Node 22 (`.nvmrc`); health check `/api/health` |
| Fonts/assets | **None external.** Procedural canvas textures (`lib/three-textures.ts`), pure-geometry text (seven-segment neon) |

## Layout

```
app/page.tsx                     Landing greeting + Nexus (+ 2D fallback)
app/worlds/[slug]/page.tsx       Realm pages (+ crawlable flat directory)
app/submit/page.tsx              App submission flow
app/api/auth/*                   Signup/login/logout/me (scrypt, cookie session)
app/api/stats/*                  Visit + heartbeat + totals
server.mjs                       Custom server: Next + ws presence/chat/rtc
components/three/nexus.tsx       The Nexus room (detail bar showcase)
components/three/world-scene.tsx Realm environments + zone kiosks
components/three/galaxy-*.tsx    Galaxy realm rebuild (in progress)
components/three/player-rig.tsx  Shared FPS controls/HUD/blink/gyro
components/three/*-canvas.tsx    ssr:false dynamic wrappers
components/multiplayer/*         Peer orbs, chat overlay, account panel
lib/data/worlds.ts               Realms → zones → approved apps (source of truth)
lib/galaxy.ts                    Seeded procedural universe
lib/server/{stats,auth}-store.ts JSON persistence (atomic, debounced)
lib/use-{session,presence,site-stats}.ts   Client hooks
lib/voice-engine.ts              WebRTC + WebAudio spatial voice
docs/                            These documents
```

## Key decisions & why

- **One service does everything.** `server.mjs` runs Next AND the
  WebSocket presence/chat/voice-signaling layer on one port. No separate
  realtime infra, no third-party realtime SaaS. Cheap, simple, and rooms
  map 1:1 to route paths.
- **Files over database.** Users, sessions, and stats are JSON on a
  mounted volume with debounced atomic writes. At current scale a DB is
  overhead; the store interfaces are narrow enough to swap later
  (Supabase was considered and remains the likely upgrade path).
- **Minimal PII on purpose.** Accounts are handle + password only — no
  email. Kids visit this site.
- **On-mesh UI, not overlays.** drei Html lags a frame relative to
  geometry ("floats") — anything that must look attached to a surface is
  painted onto a CanvasTexture (stats board, departure board pattern).
- **Everything procedural.** No CDN fonts, HDRIs, or downloaded textures.
  Deterministic seeded PRNG (mulberry32) for all generated content —
  keeps the bundle self-contained and offline-safe.
- **3D is client-only, SEO is 2D.** Every 3D page is an `ssr:false`
  dynamic wrapper with a crawlable flat fallback below the fold.

## Deployment (critical)

- **Railway deploys the repo's default branch
  `claude/vibe-coding-website-setup-62361q`, not `main`** (legacy
  accident). After merging to main, fast-forward that branch:
  `git push origin origin/main:refs/heads/claude/vibe-coding-website-setup-62361q`
- `railway.json` holds build/start config; `npm start` runs `server.mjs`.
- Verify before shipping: `npm run lint` AND `npm run build` (Next 16
  does not lint during build).

## Known limits / debts

- WebRTC voice is STUN-only — strict-NAT peer pairs may fail (no TURN).
- Voice mesh topology won't scale past small rooms (~6–8 speakers); fine
  for now, revisit (SFU/LiveKit) if rooms grow.
- JSON stores are single-instance by design — horizontal scaling would
  need the DB migration first.
- react-hooks compiler lint is strict with three.js patterns — see the
  gotchas section in [PROJECT-BRIEF.md](PROJECT-BRIEF.md).
