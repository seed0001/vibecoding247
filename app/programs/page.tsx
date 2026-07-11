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
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Credits & <span className="text-rainbow">Programs</span>
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        You shouldn&apos;t pay full price to build. We track {programs.length}{" "}
        active partnership and outreach programs that hand builders real
        resources — cloud credits, model API credits, GPU grants, and student
        perks — with plain-English eligibility notes and direct application
        links.
      </p>
      <p className="mt-3 text-sm text-subtle">
        Offers change often. Each entry shows the date we last verified it —
        always confirm details on the official page before planning around
        them.
      </p>

      <div className="mt-12 space-y-14">
        {programCategories.map((category) => {
          const items = getProgramsByCategory(category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-xl font-bold tracking-tight text-accent-2">
                {category}
              </h2>
              <div className="mt-5 space-y-6">
                {items.map((program) => (
                  <div
                    key={program.slug}
                    className="rounded-2xl border border-border bg-card p-6 sm:p-8"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{program.name}</h3>
                        <p className="mt-1 text-sm text-subtle">
                          {program.provider}
                        </p>
                      </div>
                      <Pill tone="amber">{program.offer}</Pill>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {program.description}
                    </p>

                    <div className="mt-5 grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-subtle">
                          Best for
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {program.bestFor}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-subtle">
                          Eligibility
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                          {program.eligibility.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="text-accent-2">▸</span>
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
                        className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover"
                      >
                        Apply →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-bold">Run a program we should list?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          We&apos;re actively pursuing outreach partnerships to get the vibe
          coding community more building credits. If you offer credits, grants,
          or perks for builders, we&apos;d love to feature you here.
        </p>
        <a
          href="mailto:hello@vibecoding247.net?subject=Partnership%20program"
          className="mt-5 inline-block rounded-2xl border border-border bg-background px-6 py-3 text-sm font-bold transition-all hover:border-accent-2 hover:text-accent-2"
        >
          Pitch a partnership →
        </a>
      </div>
    </div>
  );
}
