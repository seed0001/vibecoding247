import Link from "next/link";
import { courses } from "@/lib/data/courses";
import { sessions } from "@/lib/data/sessions";
import { LevelBadge } from "@/components/level-badge";
import { SessionCard } from "@/components/session-card";

export default function HomePage() {
  const nextSessions = [...sessions]
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            An online school for AI-assisted development
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Learn to build software with AI — properly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Vibe Coding 24/7 teaches AI-assisted software development the way a
            good school teaches anything: sequenced curriculum, clear learning
            objectives, live instruction, and real projects. No shortcuts, no
            gimmicks.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/courses"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Browse the curriculum
            </Link>
            <Link
              href="/schedule"
              className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              View live class schedule
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          How the program works
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold">Structured courses</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Each course is a sequence of modules and lessons with explicit
              objectives and outlines. You always know what you&apos;re
              learning and why it comes next.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Live classes</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Scheduled lectures, workshops, code reviews, and office hours led
              by instructors — not recordings of someone thinking out loud.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Real projects</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every course ends with work you actually ship: deployed
              applications, hardened pipelines, production systems.
            </p>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              The curriculum
            </h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-accent hover:underline"
            >
              All courses →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-accent"
              >
                <LevelBadge level={course.level} />
                <h3 className="mt-3 text-lg font-semibold group-hover:text-accent">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {course.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming sessions */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Upcoming live classes
          </h2>
          <Link
            href="/schedule"
            className="text-sm font-medium text-accent hover:underline"
          >
            Full schedule →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {nextSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </section>
    </>
  );
}
