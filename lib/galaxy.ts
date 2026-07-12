/**
 * The Galaxy realm: a seeded, procedurally generated universe.
 * Same seed → same universe for every visitor, so "your" planet is
 * always where you left it (and your flag with it).
 */

export type PlanetKind = "rocky" | "lush" | "ice" | "desert" | "volcanic";

export interface Planet {
  id: string;
  name: string;
  kind: PlanetKind;
  position: [number, number, number];
  radius: number;
  color: string;
  atmosphereColor: string;
  cloudColor: string;
  skyColor: string;
  groundColor: string;
  fogColor: string;
  rockColor: string;
  hasRings: boolean;
  ringColor: string;
}

const UNIVERSE_SEED = 24_7_2026;
const PLANET_COUNT = 48;
const UNIVERSE_RADIUS = 900;
const MIN_SPACING = 70;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KIND_PALETTES: Record<
  PlanetKind,
  {
    colors: string[];
    atmosphere: string;
    cloud: string;
    sky: string;
    ground: string[];
    fog: string;
    rock: string;
  }
> = {
  rocky: {
    colors: ["#8d7b6c", "#9a8878", "#7d6d5f", "#a5917f"],
    atmosphere: "#c9b8a5",
    cloud: "#cfc4b8",
    sky: "#c9b8a5",
    ground: ["#8d7b6c", "#7a695b"],
    fog: "#b3a290",
    rock: "#5f5248",
  },
  lush: {
    colors: ["#4c9e58", "#3f8f63", "#5aab4f", "#3d9e71"],
    atmosphere: "#9fd8ff",
    cloud: "#ffffff",
    sky: "#8ecdf5",
    ground: ["#4c9e58", "#41874c"],
    fog: "#bfe3f7",
    rock: "#6b7d5a",
  },
  ice: {
    colors: ["#bcd9e8", "#a9cfe3", "#cde4ef", "#9dc4d8"],
    atmosphere: "#dcf1fb",
    cloud: "#f2fafe",
    sky: "#c3e2f2",
    ground: ["#cde4ef", "#b3d4e4"],
    fog: "#e2f2fa",
    rock: "#8fb4c7",
  },
  desert: {
    colors: ["#d9a75e", "#cf9a4e", "#e0b26e", "#c58f45"],
    atmosphere: "#f3d9a8",
    cloud: "#efe0c2",
    sky: "#eecf96",
    ground: ["#d9a75e", "#c29148"],
    fog: "#ecd3a1",
    rock: "#a4753a",
  },
  volcanic: {
    colors: ["#5a4a4a", "#6b4a42", "#4f4341", "#75504a"],
    atmosphere: "#e08a5f",
    cloud: "#8a7570",
    sky: "#a0674c",
    ground: ["#5a4a4a", "#463a38"],
    fog: "#8a5c48",
    rock: "#2f2624",
  },
};

const NAME_A = ["Ka", "Ve", "Zor", "Aur", "Thal", "Nym", "Ori", "Bel", "Cas", "Dra", "Eri", "Fon", "Gly", "Hex", "Ilo", "Jun"];
const NAME_B = ["ra", "lon", "dis", "mir", "tha", "vex", "nia", "dor", "los", "pha", "ri", "gan", "de", "xa", "bry", "mos"];
const NAME_C = ["Prime", "II", "III", "IV", "V", "Minor", "Major", "Deep", "Verge", "Rest", "Reach", "Haven"];

function planetName(rand: () => number): string {
  const base =
    NAME_A[Math.floor(rand() * NAME_A.length)] +
    NAME_B[Math.floor(rand() * NAME_B.length)];
  return rand() > 0.45
    ? `${base} ${NAME_C[Math.floor(rand() * NAME_C.length)]}`
    : base;
}

function generateUniverse(): Planet[] {
  const rand = mulberry32(UNIVERSE_SEED);
  const kinds: PlanetKind[] = ["rocky", "lush", "ice", "desert", "volcanic"];
  const planets: Planet[] = [];

  let attempts = 0;
  while (planets.length < PLANET_COUNT && attempts < PLANET_COUNT * 40) {
    attempts += 1;
    // spherical-ish shell distribution, keeping a clear bubble near the deck
    const r = 120 + rand() * (UNIVERSE_RADIUS - 120);
    const theta = rand() * Math.PI * 2;
    const y = (rand() - 0.5) * UNIVERSE_RADIUS * 0.55;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const tooClose = planets.some(
      (p) =>
        Math.hypot(p.position[0] - x, p.position[1] - y, p.position[2] - z) <
        MIN_SPACING,
    );
    if (tooClose) continue;

    const kind = kinds[Math.floor(rand() * kinds.length)];
    const palette = KIND_PALETTES[kind];
    planets.push({
      id: `p${planets.length}`,
      name: planetName(rand),
      kind,
      position: [x, y, z],
      radius: 6 + rand() * 14,
      color: palette.colors[Math.floor(rand() * palette.colors.length)],
      atmosphereColor: palette.atmosphere,
      cloudColor: palette.cloud,
      skyColor: palette.sky,
      groundColor: palette.ground[Math.floor(rand() * palette.ground.length)],
      fogColor: palette.fog,
      rockColor: palette.rock,
      hasRings: rand() > 0.72,
      ringColor: rand() > 0.5 ? "#c9bfa8" : "#9aa8c9",
    });
  }
  return planets;
}

/** Deterministic — computed once per module load. */
export const UNIVERSE: Planet[] = generateUniverse();

export function getPlanet(id: string): Planet | undefined {
  return UNIVERSE.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* Colony economy — outlined now, Supply Depot store comes next        */
/* ------------------------------------------------------------------ */

export interface ResourceDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const RESOURCES: ResourceDef[] = [
  {
    id: "alloy",
    name: "Titan Alloy",
    icon: "▲",
    description: "Structural metal for flag poles, pads, and buildings.",
  },
  {
    id: "energy",
    name: "Energy Cells",
    icon: "◆",
    description: "Powers your claim beacon and future colony systems.",
  },
  {
    id: "beacon",
    name: "Beacon Core",
    icon: "●",
    description: "One per claim — broadcasts your flag to the galaxy.",
  },
];

export type ResourceBag = Record<string, number>;

/** Cost to plant one flag / stake one claim. */
export const FLAG_COST: ResourceBag = { alloy: 2, energy: 1, beacon: 1 };

/** New explorers get exactly enough for their first claim. */
export const STARTER_PACK: ResourceBag = { alloy: 2, energy: 1, beacon: 1 };

export interface PlantedFlag {
  planetId: string;
  x: number;
  z: number;
  plantedAt: number;
}

const RESOURCES_KEY = "vc247-galaxy-resources";
const FLAGS_KEY = "vc247-galaxy-flags";

export function loadResources(): ResourceBag {
  try {
    const raw = window.localStorage.getItem(RESOURCES_KEY);
    if (!raw) {
      window.localStorage.setItem(RESOURCES_KEY, JSON.stringify(STARTER_PACK));
      return { ...STARTER_PACK };
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : { ...STARTER_PACK };
  } catch {
    return { ...STARTER_PACK };
  }
}

export function saveResources(bag: ResourceBag) {
  try {
    window.localStorage.setItem(RESOURCES_KEY, JSON.stringify(bag));
  } catch {
    /* session-only */
  }
}

export function canAfford(bag: ResourceBag, cost: ResourceBag): boolean {
  return Object.entries(cost).every(([k, v]) => (bag[k] ?? 0) >= v);
}

export function spend(bag: ResourceBag, cost: ResourceBag): ResourceBag {
  const next = { ...bag };
  for (const [k, v] of Object.entries(cost)) next[k] = (next[k] ?? 0) - v;
  return next;
}

export function loadFlags(): PlantedFlag[] {
  try {
    const raw = window.localStorage.getItem(FLAGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFlags(flags: PlantedFlag[]) {
  try {
    window.localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
  } catch {
    /* session-only */
  }
}
