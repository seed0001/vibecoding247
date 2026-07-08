export type AgeGroup = "kid" | "teen" | "adult";
export type KnowledgeLevel = "new" | "curious" | "builder" | "pro";

export interface LearnerProfile {
  name: string;
  ageGroup: AgeGroup;
  knowledgeLevel: KnowledgeLevel;
}

export const AGE_OPTIONS: { value: AgeGroup; label: string; emoji: string }[] = [
  { value: "kid", label: "Under 13", emoji: "🚀" },
  { value: "teen", label: "13 – 17", emoji: "⚡" },
  { value: "adult", label: "18 or older", emoji: "🌟" },
];

export const KNOWLEDGE_OPTIONS: {
  value: KnowledgeLevel;
  label: string;
  detail: string;
  emoji: string;
}[] = [
  {
    value: "new",
    label: "Brand new",
    detail: "I've heard about AI but never really used it",
    emoji: "🌱",
  },
  {
    value: "curious",
    label: "Curious explorer",
    detail: "I've chatted with AI, but never built anything",
    emoji: "🔍",
  },
  {
    value: "builder",
    label: "Builder",
    detail: "I've made things with AI tools before",
    emoji: "🛠️",
  },
  {
    value: "pro",
    label: "Power user",
    detail: "I build with AI all the time — challenge me",
    emoji: "🏆",
  },
];

/** Maps a knowledge level to the course slug of the recommended learning path. */
export const PATH_FOR_LEVEL: Record<KnowledgeLevel, string> = {
  new: "vibe-coding-foundations",
  curious: "vibe-coding-foundations",
  builder: "spec-driven-development",
  pro: "production-systems-with-ai",
};

const STORAGE_KEY = "vc247-profile";

export function loadProfile(): LearnerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearnerProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: LearnerProfile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable (private mode etc.) — profile just won't persist
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
