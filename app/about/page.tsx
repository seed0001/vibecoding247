import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Vibe Coding 24/7 is an informational, educational, community-driven hub for people building software with AI.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        About
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        About Vibe Coding 24/7
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        <p>
          AI-assisted development has made building software accessible to
          just about everyone. What it hasn&apos;t made easy is keeping up:
          the tools change monthly, the good advice is scattered across a
          hundred threads, and the programs that would fund your builds are
          buried in enterprise marketing pages.
        </p>
        <p>
          Vibe Coding 24/7 pulls it into one place. We&apos;re an
          informational, educational, community-driven hub — not a bootcamp,
          not a product, no login required.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">What we do</h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted">
          <div>
            <h3 className="font-medium text-foreground">How-to guides</h3>
            <p className="mt-1">
              Practical, tested walkthroughs for building and shipping apps
              with AI — prompting, tooling, debugging, deploying, and securing
              what you build.{" "}
              <Link href="/guides" className="text-accent hover:underline">
                Browse guides →
              </Link>
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">The Pulse</h3>
            <p className="mt-1">
              A trend radar on what&apos;s moving in AI-assisted development,
              live feeds of what&apos;s rising on GitHub and Hugging Face, and
              pointers to where the community actually gathers.{" "}
              <Link href="/pulse" className="text-accent hover:underline">
                View the Pulse →
              </Link>
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">
              Credits &amp; programs
            </h3>
            <p className="mt-1">
              A verified directory of partnership and outreach programs —
              cloud credits, API credits, GPU grants — so builders can fund
              their projects instead of abandoning them.{" "}
              <Link href="/programs" className="text-accent hover:underline">
                Find credits →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          Community-driven
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          The roadmap comes from builders: the guides we write next are the
          questions the community asks most, and the trend radar reflects
          what people are actually shipping and talking about. If
          something&apos;s missing — a guide, a trend we slept on, a credits
          program we haven&apos;t listed — tell us in the communities on the
          Pulse page and it goes on the list.
        </p>
      </section>

      <div className="mt-12">
        <Link
          href="/guides"
          className="inline-block rounded-md bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Start building
        </Link>
      </div>
    </div>
  );
}
