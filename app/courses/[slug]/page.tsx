import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/lib/data/courses";
import { LevelBadge } from "@/components/level-badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/courses" className="text-sm text-accent hover:underline">
        ← All learning paths
      </Link>

      <div className="mt-6">
        <LevelBadge level={course.level} />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {course.title}
        </h1>
        <p className="mt-4 leading-relaxed text-muted">{course.description}</p>
      </div>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">What you&apos;ll be able to do</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2">
                <span className="text-accent">✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">Prerequisites</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {course.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Syllabus</h2>
        <div className="mt-6 space-y-8">
          {course.modules.map((mod, i) => (
            <div key={mod.title}>
              <h3 className="font-semibold">
                <span className="text-subtle">Module {i + 1}.</span> {mod.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {mod.description}
              </p>
              <ol className="mt-4 divide-y divide-border rounded-lg border border-border">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                      className="group flex items-baseline justify-between gap-4 p-4 transition-colors hover:bg-card"
                    >
                      <div>
                        <p className="font-medium group-hover:text-accent">
                          {lesson.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {lesson.summary}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm text-subtle">
                        {lesson.durationMinutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
