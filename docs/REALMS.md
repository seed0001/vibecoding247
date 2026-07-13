# The Five Realms — Direction & Plans

> Each realm is a portal world reached from a Nexus pedestal, lives at
> `/worlds/[slug]`, holds community apps at kiosks, and can grow
> infinitely. Directions below are owner-locked (2026-07-13); details are
> working notes to refine as each build starts. Last updated: 2026-07-13.

---

## 1. The Grand Terminal (`terminal`) → THE CONSOLE REALM

**Vibe today**: grand train-station colonnade, amber light, departures
board. **Becomes**: the retro-console district.

- Framed like a "PlayStation emulator" hall — but **NOT actual PlayStation
  ROMs or copyrighted games/assets**. Instead, original **3D
  reimaginings/reenactments of classic console-era games**: the genres,
  feels, and mechanics of the golden console age rebuilt as walk-in,
  first-person 3D experiences.
- The realm is the "console area" of the site — you walk the terminal and
  board experiences the way you'd board trains.
- Design questions to settle at build time: how a "game within the world"
  launches (portal room per game vs. full scene swap), how community
  console-style submissions slot in alongside our in-house reenactments.

## 2. The Resort (`resort`) → ALL-INCLUSIVE RESORT + THEME PARK

**Vibe today**: elevators, red carpet, marquee bulbs, pink. **Becomes**: a
two-sided all-inclusive destination.

- **Adult side**: sandy beaches, casino games (entertainment only — no real
  gambling/wagering).
- **Kid side**: a full theme park — costumed characters, fun kid games,
  roller coasters and rides, midway/amusement-park games.
- One realm, two vibes; the split itself is a navigation feature (beach
  boardwalk on one horizon, coaster skyline on the other).
- Rides are a first-person opportunity: coaster cams, water rides, ferris
  wheel overlooks of the whole realm.

## 3. The Neon Metropolis (`metropolis`) → THE MALL

**Vibe today**: night skyline, cyan neon. **Becomes**: a huge walkable 3D
shopping mall doing **real commerce**.

- Real products, real storefronts that people/businesses can **lease** to
  display and sell their products inside the 3D environment.
- First realm with a business model attached — see
  [BUSINESS.md](BUSINESS.md) for the leasing model notes.
- Build implications: storefront template system (lease slot = configurable
  unit), product display cases, links out to sellers' own checkout (we
  don't process payments for tenants at v1).

## 4. The Wonders (`wonders`) → ECOSYSTEMS / GPU BENCHMARK

**Vibe today**: pyramid + colonnade in daylight, green. **Becomes**: the
most realistic, lifelike natural ecosystems we can build — structured as a
**graphics benchmark**.

- Several distinct climate types/biomes (exact set TBD — candidates:
  rainforest, desert, tundra, coral reef, grassland savanna).
- **Tiered realism ladder**: each ecosystem scales from very basic /
  minimal graphics up to extreme "8K"-grade realism designed to
  deliberately tax the user's GPU — "how much can your system take."
- Extreme tiers: **millions of blades of grass** (GPU instancing),
  **hundreds of thousands of critters** roaming with (spatial) sound.
- Benchmark framing: on-screen FPS/score readout so users can compare
  rigs. Think 3DMark-meets-nature-documentary.
- Low tiers keep phones and integrated graphics happy; the ladder is the
  feature.

## 5. The Galaxy (`galaxy`) → PROCEDURAL UNIVERSE  *(in progress)*

**Vibe today**: floating deck in a starfield, indigo. **Becoming**: a
seeded procedural universe.

- Groundwork committed: `lib/galaxy.ts` (seeded procedural generation,
  planet palettes/naming), `galaxy-experience.tsx` scene.
- Planet rendering: GPU shader terrain ported from
  dgreenheck/threejs-procedural-planets (MIT) — `lib/planet-shaders.ts`,
  `lib/planet-material.ts`, `procedural-planet.tsx`. Five-layer elevation
  colors per kind, tinted particle atmospheres + rim glow, banded rings,
  lava glow on volcanic worlds.
- Next build: **ship flight → planet descent → surface exploration**, plus
  a **flag-claim resource economy** (claim planets, outlined in
  lib/galaxy.ts).

---

## Shared realm rules

- Every realm keeps its 4 genre zones + kiosks for community apps and a
  return portal to the Nexus.
- Every realm eventually hits the Nexus detail bar (procedural textures,
  real lighting, on-mesh UI — no floating drei Html).
- Multiplayer presence/chat/voice works in every realm automatically
  (rooms are route paths).
- No external 3D assets: procedural geometry and canvas textures only.
