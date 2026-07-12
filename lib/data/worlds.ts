export interface SubmittedApp {
  name: string;
  url: string;
  author: string;
  blurb: string;
}

export interface WorldZone {
  slug: string;
  name: string;
  description: string;
  /** Apps that have been submitted and approved for this zone. */
  apps: SubmittedApp[];
}

export interface World {
  slug: string;
  name: string;
  tagline: string;
  emblem: string;
  /** Primary glow color used for portals, signage, and accents. */
  color: string;
  /** One-line flavor shown in the Nexus and on the 2D fallback. */
  flavor: string;
  zones: WorldZone[];
}

/**
 * The five launch worlds of the Vibe Coding 24/7 hub. Each starts as an
 * arrival plaza with genre zones and open app slots, and can grow
 * infinitely in its own direction.
 *
 * To feature a submitted app, add it to the right zone's `apps` array —
 * every world scene, board, and the sitemap pick it up automatically.
 */
export const worlds: World[] = [
  {
    slug: "terminal",
    name: "The Grand Terminal",
    tagline: "Every platform departs from here",
    emblem: "🚂",
    color: "#f59e0b",
    flavor:
      "A cathedral-scale station. Every gate on the departure board is someone's app, now boarding.",
    zones: [
      {
        slug: "games",
        name: "Games Line",
        description: "Playable things — arcade, puzzles, toys, worlds.",
        apps: [],
      },
      {
        slug: "tools",
        name: "Tools Line",
        description: "Utilities and workflows that do real work.",
        apps: [],
      },
      {
        slug: "ai",
        name: "AI Line",
        description: "Chatbots, generators, agents, and experiments.",
        apps: [],
      },
      {
        slug: "weird",
        name: "Platform 13",
        description: "The unclassifiable. The beautiful and strange.",
        apps: [],
      },
    ],
  },
  {
    slug: "resort",
    name: "The Resort",
    tagline: "Every door is a different game",
    emblem: "🎰",
    color: "#f472b6",
    flavor:
      "A glowing arcade hotel. Pick a floor, walk the hall, open a door — someone built what's inside.",
    zones: [
      {
        slug: "arcade",
        name: "Arcade Floor",
        description: "Games and playgrounds, door after door.",
        apps: [],
      },
      {
        slug: "workshop",
        name: "Workshop Floor",
        description: "Builder tools, dashboards, and tinkering rooms.",
        apps: [],
      },
      {
        slug: "gallery",
        name: "Gallery Floor",
        description: "Creative AI — art, music, words, and wonder.",
        apps: [],
      },
      {
        slug: "penthouse",
        name: "The Penthouse",
        description: "Featured builds. Invitation only (for now).",
        apps: [],
      },
    ],
  },
  {
    slug: "galaxy",
    name: "The Galaxy",
    tagline: "Every app is a star",
    emblem: "🌌",
    color: "#818cf8",
    flavor:
      "Infinite space where every approved submission ignites a new star. The galaxy grows as we do.",
    zones: [
      {
        slug: "arcade-nebula",
        name: "Arcade Nebula",
        description: "A cluster of playable worlds.",
        apps: [],
      },
      {
        slug: "forge-system",
        name: "The Forge System",
        description: "Tools and infrastructure, orbiting close.",
        apps: [],
      },
      {
        slug: "signal-cluster",
        name: "Signal Cluster",
        description: "AI experiments broadcasting on all frequencies.",
        apps: [],
      },
      {
        slug: "deep-space",
        name: "Deep Space",
        description: "Uncharted. Anything can appear out here.",
        apps: [],
      },
    ],
  },
  {
    slug: "metropolis",
    name: "The Neon Metropolis",
    tagline: "Your app gets a storefront",
    emblem: "🌆",
    color: "#22d3ee",
    flavor:
      "A city at night that never stops growing. Every submission opens a glowing storefront on the street.",
    zones: [
      {
        slug: "arcade-district",
        name: "Arcade District",
        description: "Games behind every neon sign.",
        apps: [],
      },
      {
        slug: "makers-quarter",
        name: "Maker's Quarter",
        description: "Tools, dashboards, and honest work.",
        apps: [],
      },
      {
        slug: "gallery-row",
        name: "Gallery Row",
        description: "Creative AI storefronts and studios.",
        apps: [],
      },
      {
        slug: "the-labs",
        name: "The Labs",
        description: "Experiments leaking light from basement windows.",
        apps: [],
      },
    ],
  },
  {
    slug: "wonders",
    name: "The Wonders",
    tagline: "Monuments built by builders",
    emblem: "🏛️",
    color: "#4ade80",
    flavor:
      "A mythic continent of colossal wonders, each one a genre. Apps are the treasures inside.",
    zones: [
      {
        slug: "colosseum",
        name: "The Colosseum",
        description: "Games worthy of an arena crowd.",
        apps: [],
      },
      {
        slug: "great-library",
        name: "The Great Library",
        description: "Tools and knowledge, shelved in stone.",
        apps: [],
      },
      {
        slug: "hanging-gardens",
        name: "The Hanging Gardens",
        description: "Creative AI growing in every direction.",
        apps: [],
      },
      {
        slug: "oracle",
        name: "The Oracle",
        description: "AI experiments that answer back.",
        apps: [],
      },
    ],
  },
];

export function getWorld(slug: string): World | undefined {
  return worlds.find((w) => w.slug === slug);
}
