import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/lib/data/courses";
import { LevelBadge } from "@/components/level-badge";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "The full Vibe Coding 24/7 curriculum: sequenced courses in AI-assisted software development, from first principles to production systems.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        The curriculum is sequenced. Foundations assumes no programming
        background; each later course builds on the one before it.
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
