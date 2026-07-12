import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorldCanvas } from "@/components/three/world-canvas";
import { getWorld, worlds } from "@/lib/data/worlds";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return worlds.map((world) => ({ slug: world.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) return {};
  return {
    title: `${world.name} — Vibe Coding 24/7`,
    description: world.flavor,
  };
}

export default async function WorldPage({ params }: Props) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();

  return (
    <div>
      <section className="relative h-[calc(100vh-3.5rem)] min-h-[540px] w-full">
        <WorldCanvas world={world} />
      </section>

      {/* flat directory of this world */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          {world.emblem} {world.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {world.flavor}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {world.zones.map((zone) => (
            <div
              key={zone.slug}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="font-semibold tracking-tight">{zone.name}</h2>
              <p className="mt-1 text-sm text-muted">{zone.description}</p>
              <div className="mt-4 space-y-2">
                {zone.apps.map((app) => (
                  <a
                    key={app.url}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent"
                  >
                    <span className="font-medium">{app.name}</span>
                    <span className="text-subtle"> — {app.blurb}</span>
                    <span className="mt-0.5 block text-xs text-subtle">
                      by {app.author}
                    </span>
                  </a>
                ))}
                {zone.apps.length === 0 && (
                  <Link
                    href="/submit"
                    className="block rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    Open slots — submit your app and be the first in{" "}
                    {zone.name}.
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Back to the Nexus
          </Link>
        </div>
      </section>
    </div>
  );
}
