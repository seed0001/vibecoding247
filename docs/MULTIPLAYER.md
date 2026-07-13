# Multiplayer & Social Layer — Plan and Status

> The social layer is core to the vision: people hang out TOGETHER across
> the ecosystem, seeing and hearing each other in real time.
> Last updated: 2026-07-13.

## Status: v1 is LIVE

| Piece | Status | Notes |
|---|---|---|
| Accounts | ✅ live | handle + password only (no email — kids visit); scrypt hashes; cookie `vc247_session` |
| Presence | ✅ live | glowing orbs w/ name tag + chosen color, ~10Hz smoothed, rooms = route paths |
| Text chat | ✅ live | press T or tap 💬; room-wide, server-echoed, rate-limited |
| Proximity voice | ✅ live | WebRTC mesh, spatialized (WebAudio panners) — voices come from orbs and fade with distance |
| Custom avatars | 🔜 next | replace orbs; customized at an in-world mirror |

## How it works (short version)

- `server.mjs` wraps Next and adds a WebSocket layer at `/ws` on the same
  port. Rooms are route paths ("nexus", "worlds/galaxy"), so presence
  works in every current and future realm automatically.
- The ws server authenticates by reading `sessions.json`/`users.json`
  from the data dir — no shared runtime with Next.
- Voice: WebRTC mesh signaled over the same ws ("voice" + "rtc" relay
  message types). Deterministic offerer (lower conn id) avoids glare.
  STUN only (Google) — no TURN yet. Mic-denied users get listen-only.
  Spatial audio: PannerNodes, equalpower, inverse distance, refDistance
  2, maxDistance 60; listener follows camera yaw. Chrome quirk handled
  (remote streams also attach to a muted `<audio>` element).
- Client pieces: `lib/use-session.ts`, `lib/use-presence.ts`,
  `lib/voice-engine.ts`,
  `components/multiplayer/{peer-orbs,chat-overlay,account-panel}.tsx`.

## Design principles

- **Presence everywhere, zero setup.** If a page has a 3D world, other
  people are visible in it. New realms inherit multiplayer for free.
- **Voice is proximity, not a call.** You hear people because you're near
  them, from the direction they're standing. Walking away IS hanging up.
- **Minimal identity.** A handle and a color. No profiles, no PII, no
  social graph — the shared space is the social feature.
- **Typing never moves you.** Input guards keep chat and WASD separate.

## Next phases

1. **Avatars** — replace orbs with customizable avatars; customization
   happens diegetically at an in-world mirror (no settings page).
2. **Rewards/collectibles** — visible on avatars; hidden areas and rabbit
   holes give people things to find together.
3. **Scale path** (only when needed):
   - TURN server if strict-NAT voice failures get reported.
   - Mesh → SFU (LiveKit or similar) if voice rooms exceed ~6–8 speakers.
   - JSON stores → real DB (Supabase likely) before any multi-instance
     deployment.

## Social-space intent per realm

- **Nexus** — the lobby; where you run into people by default.
- **Resort** — the hangout realm; beaches and midways are built for
  loitering together.
- **Terminal (console realm)** — spectating: watch friends play
  reenactments.
- **Metropolis (mall)** — browse together; storefronts as conversation
  pieces.
- **Wonders** — shared awe (and shared GPU suffering at max tier).
- **Galaxy** — explore/claim together once flight lands.
