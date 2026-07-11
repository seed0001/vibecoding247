export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type GuideCategory =
  | "Getting Started"
  | "Prompting"
  | "Tooling"
  | "Shipping"
  | "Safety";

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  code?: {
    language: string;
    label: string;
    snippet: string;
  };
}

export interface Guide {
  slug: string;
  title: string;
  category: GuideCategory;
  difficulty: Difficulty;
  summary: string;
  readingMinutes: number;
  /** ISO 8601 date */
  updated: string;
  takeaways: string[];
  sections: GuideSection[];
}

export type Momentum = "Hot" | "Rising" | "Steady";

export interface TrendSignal {
  title: string;
  momentum: Momentum;
  description: string;
  tags: string[];
}

export interface CommunitySpot {
  name: string;
  platform: string;
  description: string;
  url: string;
}

export interface RepoHighlight {
  fullName: string;
  url: string;
  description: string;
  stars: number;
  language: string | null;
}

export interface ModelHighlight {
  id: string;
  url: string;
  likes: number;
  downloads: number;
  pipeline: string | null;
}

export type ProgramCategory =
  | "Cloud Credits"
  | "AI & Model Credits"
  | "GPU & Compute"
  | "Students & Education"
  | "Community & Open Source";

export interface Program {
  slug: string;
  name: string;
  provider: string;
  category: ProgramCategory;
  /** Headline of what you can get, e.g. "Up to $150,000 in Azure credits" */
  offer: string;
  description: string;
  bestFor: string;
  eligibility: string[];
  applyUrl: string;
  applyNotes: string;
  /** ISO date we last checked the details */
  verified: string;
}
