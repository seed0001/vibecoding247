import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vibe Coding 24/7 is an immersive, game-based learning adventure that teaches AI-assisted software development.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        About Vibe Coding <span className="text-rainbow">24/7</span>
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        <p>
          AI-assisted development — vibe coding — has made building software
          accessible to just about everyone. But learning it shouldn&apos;t feel
          like homework, and it shouldn&apos;t require wading through scattered
          threads and tool demos.
        </p>
        <p>
          Vibe Coding 24/7 turns it into an adventure. Byte, your AI guide,
          meets you where you are — whatever your age, whatever your experience
          — and sets you on a learning path that fits. Every path is a real,
          sequenced curriculum underneath: modules, lessons, clear objectives,
          and projects you actually ship.
        </p>
        <p>
          Live classes keep it human: scheduled workshops, code reviews, and
          office hours with real instructors, so you&apos;re never adventuring
          alone.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">What you&apos;ll learn</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">Directing AI agents:</strong>{" "}
            prompting, task decomposition, and specification writing.
          </li>
          <li>
            <strong className="text-foreground">Judgment:</strong> reading,
            evaluating, and verifying generated code without necessarily
            writing it yourself.
          </li>
          <li>
            <strong className="text-foreground">Real-world skills:</strong>{" "}
            testing, security, deployment, and operating real systems.
          </li>
        </ul>
      </section>

      <div className="mt-12">
        <Link
          href="/"
          className="rounded-2xl bg-accent px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          Meet Byte and find your path →
        </Link>
      </div>
    </div>
  );
}
