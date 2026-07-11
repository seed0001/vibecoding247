import type { Metadata } from "next";
import { Pill } from "@/components/pill";
import type { PillTone } from "@/components/pill";
import { communitySpots, trendSignals } from "@/lib/data/pulse";
import { formatCount, getTrendingModels, getTrendingRepos } from "@/lib/live";
import type { Momentum } from "@/lib/types";

export const metadata: Metadata = {
  title: "The Pulse — What's Hot in Vibe Coding",
  description:
    "The community trend radar: what's hot in AI-assisted development, trending repos on GitHub, trending models on Hugging Face, and where builders hang out.",
};

// Refresh the live GitHub / Hugging Face data hourly.
export const revalidate = 3600;

const momentumStyle: Record<Momentum, { tone: PillTone; label: string }> = {
  Hot: { tone: "pink", label: "🔥 Hot" },
  Rising: { tone: "amber", label: "📈 Rising" },
  Steady: { tone: "cyan", label: "🌊 Steady" },
};

export default async function PulsePage() {
  const [{ repos, live: reposLive }, { models, live: modelsLive }] =
    await Promise.all([getTrendingRepos(), getTrendingModels()]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        The <span className="text-rainbow">Pulse</span>
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        What&apos;s moving in vibe coding right now — our editorial trend
        radar, plus live data straight from GitHub and Hugging Face, refreshed
        hourly.
      </p>

      {/* Trend radar */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Trend radar</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trendSignals.map((signal) => {
            const style = momentumStyle[signal.momentum];
            return (
              <div
                key={signal.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <Pill tone={style.tone}>{style.label}</Pill>
                <h3 className="mt-4 font-bold leading-snug">{signal.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {signal.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {signal.tags.map((tag) => (
                    <span key={tag} className="text-xs text-subtle">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* GitHub */}
      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Blowing up on GitHub
          </h2>
          <span className="text-xs text-subtle">
            {reposLive
              ? "Live: top AI repos created in the last 30 days"
              : "Editor's picks (live feed temporarily unavailable)"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <a
              key={repo.fullName}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <p className="break-all font-mono text-sm font-bold group-hover:text-accent-2">
                {repo.fullName}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {repo.description || "No description"}
              </p>
              <p className="mt-3 text-xs text-subtle">
                ⭐ {formatCount(repo.stars)}
                {repo.language ? ` · ${repo.language}` : ""}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Hugging Face */}
      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Trending on Hugging Face
          </h2>
          <span className="text-xs text-subtle">
            {modelsLive
              ? "Live: models by trending score"
              : "Editor's picks (live feed temporarily unavailable)"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <a
              key={model.id}
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <p className="break-all font-mono text-sm font-bold group-hover:text-accent-2">
                {model.id}
              </p>
              {model.pipeline && (
                <p className="mt-2 text-xs text-accent">{model.pipeline}</p>
              )}
              <p className="mt-3 text-xs text-subtle">
                ❤️ {formatCount(model.likes)} · ⬇{" "}
                {formatCount(model.downloads)} downloads
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Community */}
      <section id="community" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-bold tracking-tight">
          Where the community lives
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Vibe coding is a team sport. These are the rooms where builders share
          what they&apos;re shipping, what broke, and what&apos;s next.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communitySpots.map((spot) => (
            <a
              key={spot.name}
              href={spot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <div className="flex items-center gap-2">
                <p className="font-bold group-hover:text-accent-2">
                  {spot.name}
                </p>
                <Pill tone="cyan">{spot.platform}</Pill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {spot.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
