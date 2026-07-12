import type { Metadata } from "next";
import Link from "next/link";
import { FirstStepsCanvas } from "@/components/three/first-steps-canvas";
import { firstStepsLessons } from "@/lib/data/first-steps";

export const metadata: Metadata = {
  title: "First Steps — Learn to Navigate a 3D World",
  description:
    "A playable 3D playground for young learners: master WASD, jumping, and collecting like a gamer, then walk into lesson stations covering computers, AI, and your first tiny build.",
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
        <div className="pointer-events-none absolute inset-x-0 top-16 flex flex-col items-center px-6 text-center">
          <h1 className="rounded-2xl bg-white/85 px-5 py-2 text-2xl font-extrabold tracking-tight text-slate-800 shadow backdrop-blur sm:text-3xl">
            First Steps 🎮
          </h1>
        </div>
      </section>

      {/* Classic list (accessibility + no-WebGL fallback) */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Why a playground?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Moving through 3D space with W-A-S-D, the mouse, and the spacebar is
          becoming a foundational computer skill — the same controls work in
          games, creative tools, and the 3D websites that are coming next.
          First Steps teaches it by playing, in first person: look around with
          the mouse, run, jump, collect the stars, say hi to the island
          creatures, then step into a glowing ring to open a lesson.
        </p>
        <h2 className="mt-10 text-xl font-semibold tracking-tight">
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
