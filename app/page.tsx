import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { Pill } from "@/components/pill";
import { guides } from "@/lib/data/guides";
import { trendSignals } from "@/lib/data/pulse";
import { programs } from "@/lib/data/programs";

const pillars = [
  {
    href: "/guides",
    emoji: "📚",
    title: "How-To Guides",
    description:
      "Practical, no-fluff walkthroughs for vibe coding and app building — from your first prompt to a deployed, secured product.",
    cta: "Browse the guides",
  },
  {
    href: "/pulse",
    emoji: "📡",
    title: "The Pulse",
    description:
      "What's hot in vibe coding right now: trend radar, what's blowing up on GitHub and Hugging Face, and where the community hangs out.",
    cta: "Check the pulse",
  },
  {
    href: "/programs",
    emoji: "🎁",
    title: "Credits & Programs",
    description:
      "A living directory of partnership and outreach programs — cloud credits, API credits, and GPU grants you can apply for today.",
    cta: "Find free credits",
  },
];

export default function HomePage() {
  const featuredGuides = guides.slice(0, 3);
  const hotSignals = trendSignals.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-10 py-20 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-2">
            The community hub for AI builders
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Learn it. Track it. <span className="text-rainbow">Ship it.</span>
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">
            Vibe Coding 24/7 is an open, community-driven home for people
            building software with AI — practical how-tos, a live pulse on
            what&apos;s trending across GitHub and Hugging Face, and a
            directory of credits programs to fund your builds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start">
            <Link
              href="/guides"
              className="rounded-2xl bg-accent px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              Start with the guides →
            </Link>
            <Link
              href="/pulse"
              className="rounded-2xl border border-border bg-card px-6 py-3 font-bold transition-all hover:-translate-y-0.5 hover:border-accent-2 hover:text-accent-2"
            >
              What&apos;s hot right now
            </Link>
          </div>
        </div>
        <Mascot size={200} />
      </section>

      {/* Pillars */}
      <section className="grid gap-6 pb-16 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <Link
            key={pillar.href}
            href={pillar.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
          >
            <span className="text-3xl">{pillar.emoji}</span>
            <h2 className="mt-4 text-lg font-bold">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {pillar.description}
            </p>
            <p className="mt-4 text-sm font-semibold text-accent-2 group-hover:underline">
              {pillar.cta} →
            </p>
          </Link>
        ))}
      </section>

      {/* Featured guides */}
      <section className="pb-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Start here: essential how-tos
          </h2>
          <Link
            href="/guides"
            className="text-sm font-semibold text-accent-2 hover:underline"
          >
            All guides →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {featuredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <div className="flex gap-2">
                <Pill tone="cyan">{guide.category}</Pill>
                <Pill>{guide.difficulty}</Pill>
              </div>
              <h3 className="mt-4 font-bold leading-snug group-hover:text-accent-2">
                {guide.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {guide.summary}
              </p>
              <p className="mt-4 text-xs text-subtle">
                {guide.readingMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pulse preview */}
      <section className="pb-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            On the radar this week
          </h2>
          <Link
            href="/pulse"
            className="text-sm font-semibold text-accent-2 hover:underline"
          >
            Full pulse →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {hotSignals.map((signal) => (
            <div
              key={signal.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <Pill tone={signal.momentum === "Hot" ? "pink" : "amber"}>
                {signal.momentum === "Hot" ? "🔥 Hot" : "📈 Rising"}
              </Pill>
              <h3 className="mt-4 font-bold leading-snug">{signal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs teaser */}
      <section className="mb-20 rounded-2xl border border-border bg-card p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">
              Don&apos;t pay full price to build
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              We track {programs.length} active credits and partnership
              programs — from $1,000 self-serve cloud credits to
              six-figure packages for AI startups — with eligibility notes and
              direct application links.
            </p>
          </div>
          <Link
            href="/programs"
            className="shrink-0 rounded-2xl bg-accent px-6 py-3 text-center font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            Browse programs →
          </Link>
        </div>
      </section>
    </div>
  );
}
