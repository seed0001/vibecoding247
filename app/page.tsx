import Link from "next/link";
import { NexusCanvas } from "@/components/three/nexus-canvas";
import { worlds } from "@/lib/data/worlds";

export default function HomePage() {
  return (
    <div>
      {/* The Nexus — you land inside it */}
      <section className="relative h-[calc(100vh-3.5rem)] min-h-[540px] w-full">
        <NexusCanvas worlds={worlds} />
      </section>

      {/* 2D fallback / classic directory */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-xl font-semibold tracking-tight">
          The five worlds
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Vibe Coding 24/7 is a hub of navigable 3D worlds where builders
          submit their apps — hosted anywhere, linked here, sorted into
          genre districts. Each world starts small and grows with every
          submission. Prefer flat pages? Everything below is clickable.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {worlds.map((world) => (
            <Link
              key={world.slug}
              href={`/worlds/${world.slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-strong hover:bg-card-raised"
            >
              <p className="text-2xl" aria-hidden>
                {world.emblem}
              </p>
              <h3 className="mt-3 font-semibold tracking-tight transition-colors group-hover:text-accent">
                {world.name}
              </h3>
              <p className="mt-1 text-xs text-subtle">{world.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {world.flavor}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-card p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight">
                Built something? Claim your spot.
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Submit any app you&apos;ve deployed — Vercel, Railway,
                Cloudflare, wherever — and it gets a home in one of the five
                worlds: a gate at the Terminal, a door at the Resort, a star
                in the Galaxy.
              </p>
            </div>
            <Link
              href="/submit"
              className="shrink-0 rounded-md bg-accent-strong px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Submit your app
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 border-t border-border pt-10 text-sm sm:grid-cols-3">
          <Link href="/pulse" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              The Pulse →
            </h3>
            <p className="mt-1 text-muted">
              Live AI &amp; dev trends from GitHub and Hugging Face.
            </p>
          </Link>
          <Link href="/programs" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              Builder credits →
            </h3>
            <p className="mt-1 text-muted">
              Verified programs funding builders — fuel for your submissions.
            </p>
          </Link>
          <Link href="/guides" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              Guides →
            </h3>
            <p className="mt-1 text-muted">
              How-tos on vibe coding, shipping, and app security.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
