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
      <Link href="/guides" className="text-sm text-accent hover:underline">
        ← All guides
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Pill tone="cyan">{guide.category}</Pill>
        <Pill>{guide.difficulty}</Pill>
        <span className="text-xs text-subtle">
          {guide.readingMinutes} min read · Updated {guide.updated}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {guide.title}
      </h1>
      <p className="mt-4 leading-relaxed text-muted">{guide.summary}</p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-accent-2">
          Key takeaways
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {guide.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex gap-2">
              <span className="text-accent">✓</span>
              {takeaway}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 space-y-12">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold tracking-tight">
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
              <ul className="mt-4 space-y-2 leading-relaxed text-muted">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="text-accent-2">▸</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {section.code && (
              <figure className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
                <figcaption className="border-b border-border px-4 py-2 text-xs font-semibold text-subtle">
                  {section.code.label}
                </figcaption>
                <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-accent-2">
                  <code>{section.code.snippet}</code>
                </pre>
              </figure>
            )}
          </section>
        ))}
      </div>

      {next && (
        <div className="mt-16 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Up next
          </p>
          <Link
            href={`/guides/${next.slug}`}
            className="mt-2 block text-lg font-bold text-accent-2 hover:underline"
          >
            {next.title} →
          </Link>
        </div>
      )}
    </article>
  );
}
