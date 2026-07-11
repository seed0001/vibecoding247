import Link from "next/link";
import { Pill } from "@/components/pill";
import { guides } from "@/lib/data/guides";
import { trendSignals } from "@/lib/data/pulse";
import { programs } from "@/lib/data/programs";

const pillars = [
  {
    href: "/guides",
    kicker: "01",
    title: "How-to guides",
    description:
      "In-depth, practical walkthroughs for AI-assisted development — from your first prompt to a deployed, secured application.",
    cta: "Browse guides",
  },
  {
    href: "/pulse",
    kicker: "02",
    title: "The Pulse",
    description:
      "A curated trend radar plus live data on what's rising across GitHub and Hugging Face, refreshed hourly.",
    cta: "View the Pulse",
  },
  {
    href: "/programs",
    kicker: "03",
    title: "Credits & programs",
    description:
      "A verified directory of partnership programs offering cloud credits, API credits, and GPU grants to builders.",
    cta: "Find funding",
  },
];

export default function HomePage() {
  const featuredGuides = guides.slice(0, 4);
  const hotSignals = trendSignals.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="border-b border-border py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          The hub for AI-assisted builders
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Build software with AI.
          <br />
          <span className="text-muted">Stay ahead of what&apos;s next.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Practical guides for vibe coding and app building, a live pulse on
          the AI development ecosystem, and a directory of credits programs
          that fund your work — in one place, no login required.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-md bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Explore the guides
          </Link>
          <Link
            href="/programs"
            className="rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Find builder credits
          </Link>
        </div>
        <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-subtle">In-depth guides</dt>
            <dd className="mt-1 font-mono text-2xl font-medium">
              {guides.length}
            </dd>
          </div>
          <div>
            <dt className="text-subtle">Trends tracked</dt>
            <dd className="mt-1 font-mono text-2xl font-medium">
              {trendSignals.length}
            </dd>
          </div>
          <div>
            <dt className="text-subtle">Programs verified</dt>
            <dd className="mt-1 font-mono text-2xl font-medium">
              {programs.length}
            </dd>
          </div>
        </dl>
      </section>

      {/* Pillars */}
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border my-16 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <Link
            key={pillar.href}
            href={pillar.href}
            className="group bg-card p-8 transition-colors hover:bg-card-raised"
          >
            <p className="font-mono text-xs text-subtle">{pillar.kicker}</p>
            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              {pillar.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {pillar.description}
            </p>
            <p className="mt-5 text-sm font-medium text-accent">
              {pillar.cta}
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </p>
          </Link>
        ))}
      </section>

      {/* Featured guides */}
      <section className="py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Essential guides
          </h2>
          <Link
            href="/guides"
            className="text-sm text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {featuredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex items-baseline justify-between gap-6 py-5"
            >
              <div className="min-w-0">
                <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
                  {guide.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-muted">
                  {guide.summary}
                </p>
              </div>
              <span className="shrink-0 text-xs text-subtle">
                {guide.category} · {guide.readingMinutes} min
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Radar preview */}
      <section className="py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            On the radar
          </h2>
          <Link href="/pulse" className="text-sm text-accent hover:underline">
            Full pulse →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {hotSignals.map((signal) => (
            <div
              key={signal.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <Pill tone={signal.momentum === "Hot" ? "critical" : "warning"}>
                {signal.momentum}
              </Pill>
              <h3 className="mt-4 font-medium leading-snug tracking-tight">
                {signal.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs teaser */}
      <section className="mb-24 mt-8 rounded-xl border border-border bg-card p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight">
              Don&apos;t pay full price to build
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              We track {programs.length} active credits and partnership
              programs — from $1,000 self-serve cloud credits to six-figure
              packages for AI startups — with eligibility notes and direct
              application links, each verified by hand.
            </p>
          </div>
          <Link
            href="/programs"
            className="shrink-0 rounded-md bg-accent-strong px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Browse programs
          </Link>
        </div>
      </section>
    </div>
  );
}
