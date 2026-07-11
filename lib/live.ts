import type { ModelHighlight, RepoHighlight } from "@/lib/types";
import { fallbackModels, fallbackRepos } from "@/lib/data/pulse";

const HOUR = 3600;

interface GitHubSearchResponse {
  items: Array<{
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
  }>;
}

/**
 * Hottest new AI repos: created in the last 30 days, ranked by stars.
 * Unauthenticated GitHub search allows 10 req/min; with hourly
 * revalidation we stay far under it. Falls back to a curated list.
 */
export async function getTrendingRepos(): Promise<{
  repos: RepoHighlight[];
  live: boolean;
}> {
  try {
    const since = new Date(Date.now() - 30 * 24 * HOUR * 1000)
      .toISOString()
      .slice(0, 10);
    const params = new URLSearchParams({
      q: `topic:ai created:>${since} stars:>50`,
      sort: "stars",
      order: "desc",
      per_page: "6",
    });
    const res = await fetch(
      `https://api.github.com/search/repositories?${params}`,
      {
        next: { revalidate: HOUR },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "vibecoding247.net",
        },
      },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data: GitHubSearchResponse = await res.json();
    if (!data.items?.length) throw new Error("GitHub API returned no items");
    return {
      live: true,
      repos: data.items.map((r) => ({
        fullName: r.full_name,
        url: r.html_url,
        description: r.description ?? "",
        stars: r.stargazers_count,
        language: r.language,
      })),
    };
  } catch {
    return { repos: fallbackRepos, live: false };
  }
}

interface HFModel {
  id: string;
  likes: number;
  downloads: number;
  pipeline_tag?: string;
}

/** Trending models on the Hugging Face Hub. Falls back to a curated list. */
export async function getTrendingModels(): Promise<{
  models: ModelHighlight[];
  live: boolean;
}> {
  try {
    const res = await fetch(
      "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=6",
      {
        next: { revalidate: HOUR },
        headers: { "User-Agent": "vibecoding247.net" },
      },
    );
    if (!res.ok) throw new Error(`HF API ${res.status}`);
    const data: HFModel[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("HF API returned no models");
    }
    return {
      live: true,
      models: data.map((m) => ({
        id: m.id,
        url: `https://huggingface.co/${m.id}`,
        likes: m.likes ?? 0,
        downloads: m.downloads ?? 0,
        pipeline: m.pipeline_tag ?? null,
      })),
    };
  } catch {
    return { models: fallbackModels, live: false };
  }
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
