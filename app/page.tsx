import Link from "next/link";
import { HubCanvas } from "@/components/three/hub-canvas";
import { guides } from "@/lib/data/guides";
import { firstStepsLessons } from "@/lib/data/first-steps";
import { programs } from "@/lib/data/programs";

const tracks = [
  {
    href: "/first-steps",
    title: "First Steps",
    audience: "Young learners & absolute beginners",
    description:
      "A floating-island world that starts from zero: what a computer is, what AI is, how to talk to it safely, and your first tiny build. No experience needed — not even a little.",
    status: `${firstStepsLessons.length} lessons live`,
    accent: "text-emerald-400",
  },
  {
    href: "/guides",
    title: "Builders",
    audience: "Developers & makers shipping with AI",
    description:
      "In-depth guides on vibe coding and app building, a live pulse on GitHub and Hugging Face trends, and a verified directory of credits programs to fund your work.",
    status: `${guides.length} guides · ${programs.length} programs`,
    accent: "text-accent",
  },
  {
    href: "/new-to-ai",
    title: "New to the AI Era",
    audience: "Experienced minds adapting to AI",
    description:
      "You already know how the world works — this track covers what changed: AI as a daily assistant, staying safe from AI-era scams, and building things you never thought you'd build.",
    status: "Track in progress",
    accent: "text-warning",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Immersive hub */}
      <section className="relative h-[calc(100vh-3.5rem)] min-h-[540px] w-full">
        <HubCanvas />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The hub for AI-assisted builders
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everyone starts somewhere. Pick your portal.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            Three tracks, one goal: making you great with AI — whether
            you&apos;re six, shipping production software, or adapting a
            lifetime of experience to new tools.
          </p>
        </div>
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs text-white/40">
          Click a portal to enter · scroll for the classic view
        </p>
      </section>

      {/* Accessible / classic path chooser */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-xl font-semibold tracking-tight">
          Choose your path
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track.href}
              href={track.href}
              className="group rounded-xl border border-border bg-card p-7 transition-colors hover:border-border-strong hover:bg-card-raised"
            >
              <p className={`text-xs font-semibold uppercase tracking-wider ${track.accent}`}>
                {track.audience}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
                {track.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {track.description}
              </p>
              <p className="mt-5 font-mono text-xs text-subtle">{track.status}</p>
            </Link>
          ))}
        </div>

        {/* Builders quick links */}
        <div className="mt-14 grid gap-4 border-t border-border pt-10 sm:grid-cols-3">
          <Link href="/guides" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              How-to guides →
            </h3>
            <p className="mt-1 text-sm text-muted">
              Prompting, tooling, shipping, debugging, and security.
            </p>
          </Link>
          <Link href="/pulse" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              The Pulse →
            </h3>
            <p className="mt-1 text-sm text-muted">
              Live trends from GitHub and Hugging Face, refreshed hourly.
            </p>
          </Link>
          <Link href="/programs" className="group">
            <h3 className="font-medium tracking-tight transition-colors group-hover:text-accent">
              Credits &amp; programs →
            </h3>
            <p className="mt-1 text-sm text-muted">
              {programs.length} verified programs funding builders right now.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
