import type { Metadata } from "next";
import { Pill } from "@/components/pill";
import {
  getProgramsByCategory,
  programCategories,
  programs,
} from "@/lib/data/programs";

export const metadata: Metadata = {
  title: "Builder Credits & Partnership Programs",
  description:
    "A living directory of outreach and partnership programs for AI builders: cloud credits, API credits, GPU grants, and student packs — with eligibility notes and application links.",
};

export default function ProgramsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Programs
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Credits &amp; partnership programs
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        {programs.length} active programs that hand builders real resources —
        cloud credits, model API credits, GPU grants, and student perks — with
        plain-English eligibility notes and direct application links.
      </p>
      <p className="mt-3 text-sm text-subtle">
        Offers change often. Each entry shows the date we last verified it;
        always confirm details on the official page.
      </p>

      <div className="mt-14 space-y-14">
        {programCategories.map((category) => {
          const items = getProgramsByCategory(category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {category}
              </h2>
              <div className="mt-4 space-y-4">
                {items.map((program) => (
                  <div
                    key={program.slug}
                    className="rounded-xl border border-border bg-card p-6 sm:p-8"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">
                          {program.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-subtle">
                          {program.provider}
                        </p>
                      </div>
                      <Pill tone="accent">{program.offer}</Pill>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {program.description}
                    </p>

                    <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                          Best for
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {program.bestFor}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle">
                          Eligibility
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                          {program.eligibility.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                      <p className="text-xs text-subtle">
                        {program.applyNotes} · Verified {program.verified}
                      </p>
                      <a
                        href={program.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                      >
                        Apply
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-8">
        <h2 className="font-semibold tracking-tight">
          Run a program we should list?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          We&apos;re actively pursuing outreach partnerships to get the vibe
          coding community more building credits. If you offer credits,
          grants, or perks for builders, we&apos;d like to feature you here.
        </p>
        <a
          href="mailto:hello@vibecoding247.net?subject=Partnership%20program"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Pitch a partnership →
        </a>
      </div>
    </div>
  );
}
