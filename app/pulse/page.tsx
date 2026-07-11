import type { Metadata } from "next";
import { Pill } from "@/components/pill";
import type { PillTone } from "@/components/pill";
import { communitySpots, trendSignals } from "@/lib/data/pulse";
import { formatCount, getTrendingModels, getTrendingRepos } from "@/lib/live";
import type { Momentum } from "@/lib/types";

export const metadata: Metadata = {
  title: "The Pulse — What's Hot in Vibe Coding",
  description:
    "The community trend radar: what's moving in AI-assisted development, trending repos on GitHub, trending models on Hugging Face, and where builders gather.",
};

// Refresh the live GitHub / Hugging Face data hourly.
export const revalidate = 3600;

const momentumTone: Record<Momentum, PillTone> = {
  Hot: "critical",
  Rising: "warning",
  Steady: "neutral",
};

export default async function PulsePage() {
  const [{ repos, live: reposLive }, { models, live: modelsLive }] =
    await Promise.all([getTrendingRepos(), getTrendingModels()]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Pulse
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        What&apos;s moving right now
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Our editorial trend radar for AI-assisted development, alongside live
        data from GitHub and Hugging Face, refreshed hourly.
      </p>

      {/* Trend radar */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Trend radar</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendSignals.map((signal) => (
            <div
              key={signal.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <Pill tone={momentumTone[signal.momentum]}>
                  {signal.momentum}
                </Pill>
              </div>
              <h3 className="mt-4 font-medium leading-snug tracking-tight">
                {signal.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {signal.description}
              </p>
              <p className="mt-4 font-mono text-xs text-subtle">
                {signal.tags.map((tag) => `#${tag}`).join("  ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub */}
      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Rising on GitHub
          </h2>
          <span className="text-xs text-subtle">
            {reposLive
              ? "Live — top AI repositories created in the last 30 days"
              : "Editor's picks — live feed temporarily unavailable"}
          </span>
        </div>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {repos.map((repo) => (
            <a
              key={repo.fullName}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-6 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-medium transition-colors group-hover:text-accent">
                  {repo.fullName}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-muted">
                  {repo.description || "No description"}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-subtle">
                {formatCount(repo.stars)} stars
                {repo.language ? ` · ${repo.language}` : ""}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Hugging Face */}
      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Trending on Hugging Face
          </h2>
          <span className="text-xs text-subtle">
            {modelsLive
              ? "Live — models by trending score"
              : "Editor's picks — live feed temporarily unavailable"}
          </span>
        </div>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {models.map((model) => (
            <a
              key={model.id}
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-6 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-medium transition-colors group-hover:text-accent">
                  {model.id}
                </p>
                {model.pipeline && (
                  <p className="mt-1 text-sm text-muted">{model.pipeline}</p>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-subtle">
                {formatCount(model.likes)} likes ·{" "}
                {formatCount(model.downloads)} downloads
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Community */}
      <section id="community" className="mt-16 scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight">
          Where the community gathers
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The rooms where builders share what they&apos;re shipping, what
          broke, and what&apos;s next.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communitySpots.map((spot) => (
            <a
              key={spot.name}
              href={spot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-strong hover:bg-card-raised"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium tracking-tight transition-colors group-hover:text-accent">
                  {spot.name}
                </p>
                <Pill>{spot.platform}</Pill>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {spot.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
