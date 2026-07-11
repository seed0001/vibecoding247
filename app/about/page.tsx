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
      <h1 className="text-3xl font-bold tracking-tight">
        About Vibe Coding <span className="text-rainbow">24/7</span>
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        <p>
          AI-assisted development — vibe coding — has made building software
          accessible to just about everyone. What it hasn&apos;t made easy is
          keeping up: the tools change monthly, the good advice is scattered
          across a hundred threads, and the programs that would fund your
          builds are buried in enterprise marketing pages.
        </p>
        <p>
          Vibe Coding 24/7 pulls it into one place. We&apos;re an
          informational, educational, community-driven hub — not a bootcamp,
          not a product, no login required.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">What we do</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">How-to guides:</strong>{" "}
            practical, tested walkthroughs for building and shipping apps with
            AI — prompting, tooling, debugging, deploying, and securing what
            you build.{" "}
            <Link href="/guides" className="text-accent-2 hover:underline">
              Browse guides →
            </Link>
          </li>
          <li>
            <strong className="text-foreground">The Pulse:</strong> a trend
            radar on what&apos;s hot in vibe coding, live feeds of what&apos;s
            rising on GitHub and Hugging Face, and pointers to where the
            community actually hangs out.{" "}
            <Link href="/pulse" className="text-accent-2 hover:underline">
              Check the pulse →
            </Link>
          </li>
          <li>
            <strong className="text-foreground">Credits & programs:</strong> a
            verified directory of partnership and outreach programs — cloud
            credits, API credits, GPU grants — so builders can fund their
            projects instead of abandoning them.{" "}
            <Link href="/programs" className="text-accent-2 hover:underline">
              Find credits →
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Community-driven</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          The roadmap comes from builders: the guides we write next are the
          questions the community asks most, and the trend radar reflects what
          people are actually shipping and talking about. If something&apos;s
          missing — a guide, a trend we slept on, a credits program we
          haven&apos;t listed — tell us in the communities on the Pulse page
          and it goes on the list.
        </p>
      </section>

      <div className="mt-12">
        <Link
          href="/guides"
          className="rounded-2xl bg-accent px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          Start building →
        </Link>
      </div>
    </div>
  );
}
