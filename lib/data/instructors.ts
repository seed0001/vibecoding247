import type { Instructor } from "@/lib/types";

export const instructors: Instructor[] = [
  {
    slug: "staff",
    name: "Vibe Coding 24/7 Faculty",
    title: "Instructor",
    bio: "Placeholder instructor profile. Replace with real faculty bios as the teaching team is finalized.",
  },
];

export function getInstructor(slug: string): Instructor | undefined {
  return instructors.find((i) => i.slug === slug);
}
