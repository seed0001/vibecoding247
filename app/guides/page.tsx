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
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        How-To <span className="text-rainbow">Guides</span>
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Practical walkthroughs for building real software with AI — written for
        builders, not spectators. Start at the top if you&apos;re new; jump to
        what&apos;s biting you if you&apos;re mid-build.
      </p>

      <div className="mt-12 space-y-14">
        {categoryOrder.map((category) => {
          const items = guides.filter((g) => g.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-xl font-bold tracking-tight text-accent-2">
                {category}
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {items.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Pill>{guide.difficulty}</Pill>
                      <span className="text-xs text-subtle">
                        {guide.readingMinutes} min read
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold leading-snug group-hover:text-accent-2">
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

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-bold">Want a guide we haven&apos;t written?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          This site is community-driven. Tell us what you&apos;re stuck on in
          the communities listed on the Pulse page, and the most-requested
          topics become the next guides.
        </p>
        <Link
          href="/pulse#community"
          className="mt-5 inline-block rounded-2xl border border-border bg-background px-6 py-3 text-sm font-bold transition-all hover:border-accent-2 hover:text-accent-2"
        >
          Find the community →
        </Link>
      </div>
    </div>
  );
}
