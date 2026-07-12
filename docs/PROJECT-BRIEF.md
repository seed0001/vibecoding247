# Vibe Coding 24/7 — Project Brief

> Paste this into a new session to get up to speed. Last updated: 2026-07-12.

## What this is

**vibecoding247.net** (repo: `seed0001/vibecoding247`, deployed on Railway) is a
**first-person 3D application/game hub**. Vibe coders submit links to apps
they've deployed anywhere (Vercel, Railway, HF Spaces, …) and each approved app
gets a home inside one of five navigable 3D worlds ("realms"). Visitors drop
straight into 3D, walk around, and discover community-built games and apps.

The site went through several pivots this project cycle (course platform →
info/community hub → learning tracks) before landing on the current vision.
The owner directs by voice-transcribed messages, moves fast, changes direction
boldly, and tests everything himself on the live site. **Ship fast, merge to
main, let him test. Don't over-verify. Don't take screenshots unless something
is visually new and untested.**

## The experience (current state, live)

1. **Landing (`/`)**: greeting overlay ("Hey. Welcome in." — Enter/click) →
   drops you first-person into **the Nexus**.
2. **The Nexus**: a small, highly detailed round room (deliberately modest —
   the joke is that five tiny objects on pedestals open into infinite worlds).
   Detail pass done: reflective floor (MeshReflectorMaterial), procedural
   plaster/wood/rug textures, wainscot + moldings + pilasters, five arched
   alcoves with world-colored rim lights, domed ceiling with star oculus +
   moonlight shaft + drifting dust motes, warm sconces (one flickers),
   seven-segment **pink neon "24/7" sign** (pure geometry, no fonts), a
   builder's **desk** with glowing laptop/mug/books, and a **live stats board**.
3. **Stats board** (under the neon sign): painted onto a CanvasTexture on the
   mesh (NOT drei Html — Html overlays lag a frame and "float"; owner hates
   that). Rows: VISITORS, EXPLORERS ONLINE, REALMS (5), GAME CAPACITY (∞),
   ACTIVE GAMES (live count of submitted apps), TIME EXPLORED (accumulated).
4. **Five realms** at `/worlds/[slug]`, each a distinct environment with 4
   genre zones (kiosks) + a return portal:
   - `terminal` — The Grand Terminal (colonnade, amber, departures board)
   - `resort` — The Resort (elevators, red carpet, marquee bulbs, pink)
   - `galaxy` — The Galaxy (floating deck in a starfield, indigo)
   - `metropolis` — The Neon Metropolis (night skyline, cyan)
   - `wonders` — The Wonders (pyramid + colonnade in daylight, green)
   Realms are PORTALS; the games live inside them. Capacity is infinite.
5. **Submissions** (`/submit`): template'd mailto to submit@vibecoding247.net.
   Approving an app = adding it to the right zone's `apps` array in
   `lib/data/worlds.ts` — the 3D kiosks, Terminal departure board, stats
   board ACTIVE GAMES count, and flat directories all update automatically.
6. **Legacy content still reachable** (footer links): `/first-steps` (a
   first-person kids' playground with critters, sound effects, and TTS
   lessons), `/guides` (7 how-tos), `/pulse` (live GitHub/HF trends, hourly
   ISR), `/programs` (verified builder-credits directory), `/new-to-ai` stub.
   These predate the hub pivot; owner said "they all suck and will change" —
   expect drastic realism upgrades per area, directed one at a time.

## Controls (shared player rig)

`components/three/player-rig.tsx` — used by Nexus and all worlds:
- **Desktop**: pointer-lock mouse look (click to lock, ESC frees cursor),
  WASD/arrows move, SPACE jump (input queued on keydown so taps land),
  crosshair while locked, E = interact (kiosk prompt opens app/submit).
- **Mobile**: left-thumb virtual joystick (analog), right-thumb JUMP button,
  gyro "move your phone to look" (iOS permission requested from the greeting
  Enter gesture; opt-in button in worlds; touch-drag fallback).
- **Blink overlay**: eyelids open on entering a space, occasional blinks —
  sells first-person embodiment. No visible avatar (owner hated it).
  Avatar customization via an in-world mirror is planned for later.
- Warps (pedestals, return portals) exit pointer lock before router.push.

## Multiplayer (live)

- **Accounts**: handle + password only (no email — minimal PII, kids visit).
  scrypt-hashed users + sessions persisted alongside stats (/data volume).
  Routes under /api/auth/*; session cookie `vc247_session` (httpOnly).
- **Presence**: custom server (`server.mjs` — `npm start` now runs it) wraps
  Next and adds a WebSocket layer at `/ws` on the same port. Rooms = route
  paths ("nexus", "worlds/galaxy"). Signed-in users appear to each other as
  **glowing orbs** (their chosen color, name tag) in the Nexus and all
  worlds, positions smoothed at ~10Hz. The ws server authenticates by
  reading sessions.json/users.json from the data dir (no shared runtime
  with Next).
- **Chat**: press T (or tap 💬) — room-wide text chat, server-echoed,
  rate-limited. Typing never triggers WASD (input guard checks target).
- **Orb color**: picked at signup, changeable from the account chip
  (top-left of every 3D page).
- **Next phases**: WebRTC proximity VOICE using this same ws server for
  signaling (owner wants people to literally talk); custom avatars to
  replace orbs later, customized at an in-world mirror.
- Client pieces: `lib/use-session.ts`, `lib/use-presence.ts`,
  `components/multiplayer/{peer-orbs,chat-overlay,account-panel}.tsx`.
- Galaxy realm rebuild is IN PROGRESS: `lib/galaxy.ts` (seeded procedural
  universe, planet palette/naming, flag-claim resource economy outline)
  is committed groundwork; the ship/flight/descent/surface experience is
  the next build. See the roadmap.

## Stats engine

- `lib/server/stats-store.ts`: in-memory + debounced atomic JSON writes.
  Persists to `STATS_DIR` → `/data` (Railway volume) → `.stats/` fallback.
  Owner was walked through attaching a Railway volume at `/data` — verify
  it exists before assuming totals persist across deploys.
- Routes: `GET /api/stats`, `POST /api/stats/visit` (one count per browser
  session), `POST /api/stats/heartbeat` (fetch JSON or sendBeacon text,
  deltas capped at 120s). All return realms/games counts too.
- Client: `lib/use-site-stats.ts` — visit on mount, heartbeat every 25s
  while tab visible, sendBeacon flush on tab hide, pauses when hidden.

## ⚠️ Deployment — READ THIS OR THE SITE GOES STALE

- **The repo's default branch is `claude/vibe-coding-website-setup-62361q`,
  NOT `main` — and Railway deploys THAT branch.** (Legacy accident; owner
  hasn't changed it.) After every merge to main you MUST fast-forward it:
  `git push origin origin/main:refs/heads/claude/vibe-coding-website-setup-62361q`
  This push is what triggers the Railway deploy.
- Better long-term fix (suggest occasionally, don't nag): owner changes
  GitHub default branch to `main`, or points Railway's source at `main`.
- Health check is `/api/health`; `railway.json` holds build/start config;
  Node 22 pinned via `.nvmrc`.

## Workflow conventions

- Develop on the working branch (`claude/repo-status-check-w5l459` this
  session — a new session may get its own designated branch; same pattern),
  then: commit → push → **PR to main → squash merge immediately** (owner has
  standing approval — he says "get it merged so it deploys") → sync the
  Railway branch (above) → reset working branch onto `origin/main`
  (`git checkout -B <branch> origin/main && git push --force-with-lease`).
  Because merges are SQUASHED, never stack a new PR on pre-squash commits —
  rebase `--onto origin/main <old-base>` if needed.
- GitHub access is via MCP tools (`mcp__github__*`), no `gh` CLI.
- Run `npm run lint` AND `npm run build` before every ship. Both must be
  clean. Build ≠ lint here (Next 16 doesn't lint during build).

## Code gotchas (hard-won)

- **Next.js 16.2.10** — AGENTS.md says read `node_modules/next/dist/docs/`
  before coding; this repo uses the PREVIOUS caching model (no
  `cacheComponents`), so `fetch(..., { next: { revalidate } })` and route
  `export const revalidate` work. API routes that must not prerender need
  `export const dynamic = "force-dynamic"`.
- **react-hooks compiler lint is strict**: function params holding refs must
  be named `*Ref` or mutations get flagged; no direct property assignment on
  three objects in components (use `.set()` / `.copy()` methods — e.g.
  `camera.rotation.set(pitch, yaw, 0, "YXZ")`, never `camera.rotation.y =`);
  no `Math.random()`/impure calls during render (seed with mulberry32 or move
  to module functions in `lib/` — the linter doesn't trace cross-module);
  no setState-in-effect (use `useSyncExternalStore` for env probes); no
  curried event-handler factories called during render.
- **drei Html floats** relative to geometry during camera motion (1-frame
  lag). For anything that must look attached to a surface, paint a
  CanvasTexture on the mesh instead (see StatsBoard / departure board
  pattern in `components/three/nexus.tsx` / `world-scene.tsx`). When Html is
  used anyway, pass `zIndexRange={[5, 0]}` so it stays under page overlays.
- **No external 3D assets**: no CDN fonts (drei Text/troika loads fonts
  remotely — avoided; the neon "24/7" is seven-segment boxes), no HDRIs, no
  texture downloads. Procedural canvas textures live in
  `lib/three-textures.ts` (seeded PRNG, deterministic).
- 3D scenes are client-only: `dynamic(() => …, { ssr: false })` wrappers
  (`*-canvas.tsx`). Every 3D page keeps a crawlable 2D fallback below the
  fold (SEO + no-WebGL).
- The sandbox where Claude runs blocks some outbound domains (e.g.
  huggingface.co, the live site itself) — code fallbacks handle it; don't
  mistake sandbox blocks for production bugs. GitHub API works. Playwright +
  swiftshader WebGL works for screenshots, but see owner preference below.

## Owner preferences

- Merge and deploy immediately after changes; he tests live himself.
  He got annoyed at repeated screenshot-verification rounds — verify with
  lint/build/functional curls, screenshot only genuinely new visuals, once.
- Direct, concise updates. No hedging. He'll say things bluntly; match energy
  by being decisive, not defensive.
- Voice transcription quirks: "pipe coding" = vibe coding, "Versailles" =
  Vercel, "three d" = 3D, "merror" = mirror, etc. Read generously.
- Emails in use (placeholders he may change): hello@vibecoding247.net,
  submit@vibecoding247.net.

## Roadmap (owner-stated, in rough order)

1. **Drastic realism upgrades everywhere** — "very realistic realism type
   stuff." Nexus done first (he liked it: "looks really good dude").
   The five realm interiors are next, one at a time, same detail bar as the
   Nexus (procedural textures, real lighting/shadows, fixed-to-surface UI).
2. **Multiplayer social layer** — this is core to the vision: people hang out
   TOGETHER, hear each other in real time (proximity voice chat) in lobbies
   and throughout the ecosystem. Phases: presence (see others as avatars) →
   text → WebRTC voice (LiveKit or similar) + accounts/DB (Supabase likely).
3. **Avatar customization in a mirror** (first-person now; avatars return as
   a choice later).
4. **Rewards/prizes** — collectibles, rabbit holes, hidden areas across
   realms ("different rewards and prizes, all kinds of cool stuff").
5. **Seed the realms with real apps** so no zone is empty at launch.
6. Each realm "can grow infinitely wherever they wanna go."

## File map (key paths)

```
app/page.tsx                     Landing: greeting + Nexus (+ 2D fallback)
app/worlds/[slug]/page.tsx       Realm pages (+ flat zone directory)
app/submit/page.tsx              App submission flow
app/api/stats/*                  Stats endpoints
app/api/health/route.ts          Railway health check
components/three/nexus.tsx       The Nexus room (detail showcase)
components/three/world-scene.tsx Realm environments + zone kiosks
components/three/player-rig.tsx  Shared FPS controls/HUD/blink/gyro
components/three/*-canvas.tsx    ssr:false wrappers
lib/data/worlds.ts               Realms → zones → submitted apps (+ countApps)
lib/server/stats-store.ts        Stats persistence
lib/use-site-stats.ts            Client stats hook
lib/three-textures.ts            Procedural canvas textures
lib/data/{guides,pulse,programs,first-steps}.ts   Legacy content data
components/three/first-steps-playground.tsx       Kids' FPS playground
docs/                            Project documents (this brief)
```
