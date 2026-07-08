export type Level = "Foundations" | "Intermediate" | "Advanced";

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  objectives: string[];
  outline: string[];
}

export interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  level: Level;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  instructor: string;
  modules: Module[];
}

export interface LiveSession {
  id: string;
  title: string;
  courseSlug: string | null;
  description: string;
  instructor: string;
  /** ISO 8601, UTC */
  startsAt: string;
  durationMinutes: number;
  format: "Lecture" | "Workshop" | "Office Hours" | "Code Review";
}

export interface Instructor {
  slug: string;
  name: string;
  title: string;
  bio: string;
}
