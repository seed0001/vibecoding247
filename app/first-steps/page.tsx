import type { Metadata } from "next";
import Link from "next/link";
import { FirstStepsCanvas } from "@/components/three/first-steps-canvas";
import { firstStepsLessons } from "@/lib/data/first-steps";

export const metadata: Metadata = {
  title: "First Steps — Learn Computers & AI from Zero",
  description:
    "A friendly island world for young learners and absolute beginners: what a computer is, what AI is, how to talk to it safely, and your first tiny build.",
};

export default function FirstStepsPage() {
  const worldLessons = firstStepsLessons.map(
    ({ slug, order, title, emoji, color }) => ({
      slug,
      order,
      title,
      emoji,
      color,
    }),
  );

  return (
    <div>
      {/* Immersive island world */}
      <section className="relative h-[calc(100vh-3.5rem)] min-h-[540px] w-full">
        <FirstStepsCanvas lessons={worldLessons} />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-10 text-center">
          <h1 className="rounded-2xl bg-white/85 px-5 py-2 text-2xl font-extrabold tracking-tight text-slate-800 shadow backdrop-blur sm:text-3xl">
            First Steps 🏝️
          </h1>
          <p className="mt-3 max-w-md rounded-xl bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            Six islands, one adventure: from &quot;what IS a computer?&quot; to
            building your very first app. Click island 1 to begin!
          </p>
        </div>
      </section>

      {/* Classic list (accessibility + no-WebGL fallback) */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-semibold tracking-tight">
          The lessons, as a list
        </h2>
        <p className="mt-2 text-sm text-muted">
          Same adventure, no 3D required. Do them in order — each one builds
          on the last.
        </p>
        <ol className="mt-6 space-y-3">
          {firstStepsLessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/first-steps/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-card-raised"
              >
                <span className="text-2xl" aria-hidden>
                  {lesson.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium tracking-tight transition-colors group-hover:text-accent">
                    {lesson.order}. {lesson.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {lesson.tagline}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-subtle">
                  {lesson.minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold tracking-tight">For grown-ups</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            First Steps is designed for roughly ages 6–12, doing the lessons
            together with an adult. Every lesson ends with a hands-on
            &quot;Try it&quot; activity and includes a note for you at the
            bottom explaining what it teaches and how to help. Total time:
            about 40 minutes across six lessons — no accounts, no downloads,
            nothing to install.
          </p>
        </div>
      </section>
    </div>
  );
}
