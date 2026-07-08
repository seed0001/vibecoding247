import type { LiveSession } from "@/lib/types";

/**
 * Upcoming live classes. Times are ISO 8601 UTC.
 * Placeholder schedule — replace with real sessions (or a database)
 * as the teaching calendar firms up.
 */
export const sessions: LiveSession[] = [
  {
    id: "orientation-jul",
    title: "Program Orientation",
    courseSlug: "vibe-coding-foundations",
    description:
      "Overview of the curriculum, how live classes work, and what to set up before your first lesson. Open to all enrolled and prospective students.",
    instructor: "staff",
    startsAt: "2026-07-13T17:00:00Z",
    durationMinutes: 60,
    format: "Lecture",
  },
  {
    id: "prompting-workshop-jul",
    title: "Prompt Writing Workshop",
    courseSlug: "vibe-coding-foundations",
    description:
      "Hands-on session: bring a project idea, leave with a working prompt strategy. Covers the material from 'Writing Effective Prompts' with live exercises.",
    instructor: "staff",
    startsAt: "2026-07-15T17:00:00Z",
    durationMinutes: 90,
    format: "Workshop",
  },
  {
    id: "office-hours-jul-w3",
    title: "Open Office Hours",
    courseSlug: null,
    description:
      "Drop in with questions about any course, your own project, or tooling setup. First come, first served.",
    instructor: "staff",
    startsAt: "2026-07-17T18:00:00Z",
    durationMinutes: 60,
    format: "Office Hours",
  },
  {
    id: "spec-review-jul",
    title: "Live Spec Review",
    courseSlug: "spec-driven-development",
    description:
      "Students submit feature specs in advance; we review three of them live, then watch an agent implement the best one.",
    instructor: "staff",
    startsAt: "2026-07-21T17:00:00Z",
    durationMinutes: 90,
    format: "Code Review",
  },
  {
    id: "auth-lab-jul",
    title: "Auth Security Lab",
    courseSlug: "production-systems-with-ai",
    description:
      "Guided lab from 'Authentication Done Right': break a deliberately vulnerable auth flow, then direct an agent to fix it properly.",
    instructor: "staff",
    startsAt: "2026-07-23T17:00:00Z",
    durationMinutes: 120,
    format: "Workshop",
  },
];

export function upcomingSessions(now: Date = new Date()): LiveSession[] {
  return sessions
    .filter((s) => new Date(s.startsAt) >= now)
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}
