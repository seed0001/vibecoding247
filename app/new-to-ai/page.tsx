import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New to the AI Era",
  description:
    "A track for experienced minds adapting to AI: daily-life AI skills, safety from AI-era scams, and building things with plain language. In progress.",
};

const planned = [
  {
    title: "AI as your daily assistant",
    description:
      "Letters, research, planning, photos, health questions — how to actually use an AI helper day to day, with every step written out.",
  },
  {
    title: "Spotting AI-era scams",
    description:
      "Voice-cloning calls, fake videos, too-good-to-be-true messages: what's now possible, how to verify, and the family code-word trick.",
  },
  {
    title: "Your first build — yes, really",
    description:
      "You describe it in plain English, the AI builds it. A recipe organizer, a garden log, a family newsletter — no programming knowledge needed.",
  },
];

export default function NewToAiPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-warning">
        New to the AI Era
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
        You&apos;re not behind. The tools just changed.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        This track is for people with a lifetime of experience who want to put
        AI to work — carefully, confidently, and without the jargon. Larger
        text, patient pacing, every step spelled out, nothing assumed.
      </p>

      <div className="mt-12 rounded-xl border border-warning/30 bg-card p-6">
        <p className="text-sm font-semibold text-warning">
          This track is being built right now.
        </p>
        <p className="mt-2 text-base leading-relaxed text-muted">
          First Steps launched first; New to the AI Era is next. Here&apos;s
          what&apos;s coming:
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {planned.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold tracking-tight">
              {item.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <p className="text-base leading-relaxed text-muted">
          In the meantime, two places you might enjoy: the{" "}
          <Link href="/guides" className="text-accent hover:underline">
            Builders guides
          </Link>{" "}
          (the security guide is useful for everyone), and{" "}
          <Link href="/pulse" className="text-accent hover:underline">
            the Pulse
          </Link>{" "}
          for a sense of what&apos;s happening in AI right now.
        </p>
      </div>
    </div>
  );
}
