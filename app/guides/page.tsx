import type { Metadata } from "next";
import Link from "next/link";
import { Pill } from "@/components/pill";
import { guides } from "@/lib/data/guides";
import type { GuideCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "How-To Guides",
  description:
    "Practical how-tos for vibe coding and AI-assisted app building: prompting, tooling, shipping, debugging, and security.",
};

const categoryOrder: GuideCategory[] = [
  "Getting Started",
  "Prompting",
  "Tooling",
  "Shipping",
  "Safety",
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Guides
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        How-to guides
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Practical walkthroughs for building real software with AI. Start at
        the top if you&apos;re new; jump straight to the problem you&apos;re
        facing if you&apos;re mid-build.
      </p>

      <div className="mt-14 space-y-14">
        {categoryOrder.map((category) => {
          const items = guides.filter((g) => g.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {category}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-strong hover:bg-card-raised"
                  >
                    <div className="flex items-center gap-3">
                      <Pill>{guide.difficulty}</Pill>
                      <span className="text-xs text-subtle">
                        {guide.readingMinutes} min read
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {guide.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-8">
        <h2 className="font-semibold tracking-tight">
          Want a guide we haven&apos;t written?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          This site is community-driven. Tell us what you&apos;re stuck on in
          the communities listed on the Pulse page — the most-requested topics
          become the next guides.
        </p>
        <Link
          href="/pulse#community"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Find the community →
        </Link>
      </div>
    </div>
  );
}
