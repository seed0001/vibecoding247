import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vibe Coding 24/7 is a structured online school for AI-assisted software development.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        About Vibe Coding 24/7
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        <p>
          AI-assisted development — vibe coding — has made building software
          accessible to far more people. But most of what&apos;s available for
          learning it is scattered: viral threads, one-off videos, and tool
          demos that skip the fundamentals.
        </p>
        <p>
          Vibe Coding 24/7 treats it as a discipline worth teaching seriously.
          Our curriculum is sequenced from first principles to production
          systems, every lesson has explicit learning objectives, and live
          classes are taught on a real schedule by real instructors.
        </p>
        <p>
          We don&apos;t gamify. There are no streaks, badges, or points — just
          a clear syllabus, honest instruction, and projects you actually
          ship.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          What we teach
        </h2>
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
            <strong className="text-foreground">Professional practice:</strong>{" "}
            testing, security, deployment, and operating real systems.
          </li>
        </ul>
      </section>

      <div className="mt-12">
        <Link
          href="/courses"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          See the curriculum
        </Link>
      </div>
    </div>
  );
}
