import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FirstStepsVisitMarker } from "@/components/first-steps-visit-marker";
import {
  firstStepsLessons,
  getFirstStepsLesson,
} from "@/lib/data/first-steps";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return firstStepsLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getFirstStepsLesson(slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} — First Steps`,
    description: lesson.tagline,
  };
}

export default async function FirstStepsLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getFirstStepsLesson(slug);
  if (!lesson) notFound();

  const next = firstStepsLessons.find((l) => l.order === lesson.order + 1);
  const prev = firstStepsLessons.find((l) => l.order === lesson.order - 1);

  return (
    <div className="px-4 py-10 sm:px-6">
      <FirstStepsVisitMarker slug={lesson.slug} />

      {/* Bright, playful lesson card on the dark shell */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-amber-50 text-slate-800 shadow-2xl">
        <div
          className="px-6 pb-8 pt-10 text-center sm:px-10"
          style={{ backgroundColor: `${lesson.color}33` }}
        >
          <Link
            href="/first-steps"
            className="text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            ← Back to the islands
          </Link>
          <p className="mt-6 text-5xl" aria-hidden>
            {lesson.emoji}
          </p>
          <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-500">
            Island {lesson.order} of {firstStepsLessons.length} ·{" "}
            {lesson.minutes} minutes
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-600">
            {lesson.tagline}
          </p>
        </div>

        <div className="space-y-10 px-6 py-10 sm:px-10">
          {lesson.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-4 text-[17px] leading-relaxed text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
              {section.tryIt && (
                <div className="mt-5 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-100/70 p-5">
                  <p className="text-sm font-extrabold uppercase tracking-wider text-amber-700">
                    ⭐ Try it!
                  </p>
                  <p className="mt-2 text-[16px] font-medium leading-relaxed text-slate-800">
                    {section.tryIt}
                  </p>
                </div>
              )}
            </section>
          ))}

          <section className="rounded-2xl bg-slate-800 p-6 text-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              For grown-ups
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {lesson.grownUps}
            </p>
          </section>

          <nav className="flex items-center justify-between gap-4 border-t-2 border-slate-200 pt-6">
            {prev ? (
              <Link
                href={`/first-steps/${prev.slug}`}
                className="text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/first-steps/${next.slug}`}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-emerald-600"
              >
                Next island: {next.emoji} →
              </Link>
            ) : (
              <Link
                href="/guides"
                className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-indigo-600"
              >
                You finished! Visit Builders when you&apos;re older 🎓
              </Link>
            )}
          </nav>
        </div>
      </article>
    </div>
  );
}
