# Roadmap — Vibe Coding 24/7

> Phased plan. Order is owner-stated and can change boldly — this document
> tracks intent, not promises. Last updated: 2026-07-13.

## Shipped ✅

- First-person 3D hub: landing greeting → the Nexus → five realm portals.
- The Nexus detail pass (reflective floor, procedural textures, neon 24/7
  sign, live stats board painted on-mesh).
- Five realms live at `/worlds/[slug]`, each with 4 genre zones (kiosks)
  and a return portal.
- Shared player rig: desktop pointer-lock + WASD, mobile joystick + gyro
  look, blink overlay for embodiment.
- Submissions flow (`/submit` → mailto → approve by adding to
  `lib/data/worlds.ts`).
- Live site stats engine (visitors, explorers online, active games, time
  explored) persisted to a Railway volume.
- **Multiplayer v1**: accounts (handle + password, no email), presence orbs
  with name tags, room text chat (T), spatialized WebRTC proximity voice.
- Galaxy groundwork: `lib/galaxy.ts` seeded procedural universe +
  `galaxy-experience.tsx` scene.

## In progress 🔨

- **The Galaxy realm rebuild**: ship/flight/planet descent/surface
  experience over the committed procedural-universe groundwork, with a
  flag-claim resource economy.

## Next up (rough order)

1. **Realm buildouts, one at a time**, each to the Nexus detail bar.
   Directions are locked (see [REALMS.md](REALMS.md)):
   - Grand Terminal → Console Realm
   - Resort → all-inclusive resort + theme park
   - Metropolis → 3D shopping mall with leasable storefronts
   - Wonders → hyper-realistic ecosystems / GPU benchmark
2. **Avatar customization** — replace presence orbs with custom avatars,
   customized at an in-world mirror.
3. **Rewards & prizes** — collectibles, rabbit holes, hidden areas across
   realms.
4. **Seed the realms with real apps** so no zone is empty at launch.
5. **Legacy page upgrades** — `/first-steps`, `/guides`, `/pulse`,
   `/programs` all get drastic upgrades or replacement, directed one at a
   time.

## Later / exploratory

- Storefront leasing operations for the Metropolis mall (see
  [BUSINESS.md](BUSINESS.md)).
- Benchmark scoring/leaderboard for the Wonders tiers.
- Events: timed happenings in realms so there's a reason to show up at a
  specific hour (fits the 24/7 brand).
- TURN server for voice if strict-NAT failures become a real complaint
  (STUN-only today).

## Standing principles

- Ship fast → merge to main → sync the Railway branch → owner tests live.
- Realism keeps ratcheting up; nothing is "done," only "good for now."
- Realms grow infinitely; capacity is never the excuse.
