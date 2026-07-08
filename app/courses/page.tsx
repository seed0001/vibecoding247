import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/lib/data/courses";
import { LevelBadge } from "@/components/level-badge";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Every Vibe Coding 24/7 learning path: sequenced adventures in AI-assisted software development, from first steps to production systems.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Each path is a sequenced adventure. Foundations assumes no programming
        background; each later path builds on the one before it. Not sure where
        to start? <Link href="/" className="text-accent-2 hover:underline">Let Byte pick for you</Link>.
      </p>

      <div className="mt-10 space-y-6">
        {courses.map((course) => {
          const lessonCount = course.modules.reduce(
            (n, m) => n + m.lessons.length,
            0,
          );
          return (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group block rounded-lg border border-border bg-background p-6 transition-colors hover:border-accent"
            >
              <div className="flex flex-wrap items-center gap-3">
                <LevelBadge level={course.level} />
                <span className="text-sm text-subtle">
                  {course.modules.length} modules · {lessonCount} lessons
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold group-hover:text-accent">
                {course.title}
              </h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-muted">
                {course.description}
              </p>
              <p className="mt-3 text-sm text-subtle">
                Prerequisites: {course.prerequisites.join("; ")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
