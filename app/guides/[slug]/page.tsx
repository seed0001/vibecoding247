import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pill } from "@/components/pill";
import { getGuide, guides } from "@/lib/data/guides";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.summary };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const index = guides.findIndex((g) => g.slug === guide.slug);
  const next = guides[index + 1];

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <nav className="text-sm text-subtle">
        <Link href="/guides" className="hover:text-accent">
          Guides
        </Link>
        <span className="mx-2">/</span>
        <span className="text-muted">{guide.category}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {guide.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-subtle">
        <Pill>{guide.difficulty}</Pill>
        <span>{guide.readingMinutes} min read</span>
        <span aria-hidden>·</span>
        <span>Updated {guide.updated}</span>
      </div>

      <p className="mt-6 text-lg leading-relaxed text-muted">
        {guide.summary}
      </p>

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
          Key takeaways
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
          {guide.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {takeaway}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 space-y-12">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-4 leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 space-y-2.5 leading-relaxed text-muted">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {section.code && (
              <figure className="mt-6 overflow-hidden rounded-lg border border-border">
                <figcaption className="border-b border-border bg-card px-4 py-2 font-mono text-xs text-subtle">
                  {section.code.label}
                </figcaption>
                <pre className="overflow-x-auto bg-card p-4 text-[13px] leading-relaxed text-foreground/90">
                  <code>{section.code.snippet}</code>
                </pre>
              </figure>
            )}
          </section>
        ))}
      </div>

      {next && (
        <div className="mt-16 border-t border-border pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Up next
          </p>
          <Link
            href={`/guides/${next.slug}`}
            className="mt-2 block text-lg font-medium tracking-tight text-accent hover:underline"
          >
            {next.title} →
          </Link>
        </div>
      )}
    </article>
  );
}
