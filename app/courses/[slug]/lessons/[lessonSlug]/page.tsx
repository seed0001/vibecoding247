import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getLesson } from "@/lib/data/courses";

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return courses.flatMap((course) =>
    course.modules.flatMap((mod) =>
      mod.lessons.map((lesson) => ({
        slug: course.slug,
        lessonSlug: lesson.slug,
      })),
    ),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const found = getLesson(slug, lessonSlug);
  if (!found) return {};
  return { title: found.lesson.title, description: found.lesson.summary };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const found = getLesson(slug, lessonSlug);
  if (!found) notFound();
  const { course, module: mod, lesson } = found;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <nav className="text-sm text-subtle">
        <Link href={`/courses/${course.slug}`} className="text-accent hover:underline">
          {course.title}
        </Link>{" "}
        / {mod.title}
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {lesson.title}
      </h1>
      <p className="mt-2 text-sm text-subtle">{lesson.durationMinutes} minutes</p>
      <p className="mt-4 leading-relaxed text-muted">{lesson.summary}</p>

      <section className="mt-10 rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Learning objectives</h2>
        <p className="mt-1 text-sm text-subtle">
          By the end of this lesson you will be able to:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {lesson.objectives.map((objective) => (
            <li key={objective} className="flex gap-2">
              <span className="text-accent">✓</span>
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight">Lesson outline</h2>
        <ol className="mt-4 space-y-3">
          {lesson.outline.map((item, i) => (
            <li
              key={item}
              className="flex gap-4 rounded-lg border border-border p-4 text-sm leading-relaxed"
            >
              <span className="font-mono text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 rounded-lg border border-dashed border-border p-6 text-sm text-subtle">
        Full lesson content (video, readings, and exercises) is delivered
        during live classes while the platform&apos;s learning-management
        features are under development.
      </div>
    </div>
  );
}
