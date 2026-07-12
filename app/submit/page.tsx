import type { Metadata } from "next";
import Link from "next/link";
import { worlds } from "@/lib/data/worlds";

export const metadata: Metadata = {
  title: "Submit Your App",
  description:
    "Submit your deployed app — hosted on Vercel, Railway, Cloudflare, or anywhere — and claim a spot in one of the five worlds of Vibe Coding 24/7.",
};

const mailSubject = encodeURIComponent("App submission — Vibe Coding 24/7");
const mailBody = encodeURIComponent(
  `App name:
Live URL:
Your name / handle:
One-line description:
Which world? (Terminal / Resort / Galaxy / Metropolis / Wonders):
Which zone / genre?:
Anything else we should know?:`,
);

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Submissions
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Claim your spot in the worlds
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Built something and deployed it? It belongs here. Submit any live app —
        hosted on Vercel, Railway, Cloudflare, Fly, a Hugging Face Space,
        anywhere with a URL — and once approved it appears in one of the five
        worlds: a departure gate at the Terminal, a door at the Resort, a
        star in the Galaxy, a storefront in the Metropolis, or a treasure in
        the Wonders.
      </p>

      <div className="mt-10 rounded-xl border border-border bg-card p-8">
        <h2 className="font-semibold tracking-tight">What we need</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li>— App name and the live URL</li>
          <li>— Your name or handle (shown on your gate/door/star)</li>
          <li>— A one-line description</li>
          <li>— Which world and zone it belongs in (pick from below)</li>
        </ul>
        <a
          href={`mailto:submit@vibecoding247.net?subject=${mailSubject}&body=${mailBody}`}
          className="mt-6 inline-block rounded-md bg-accent-strong px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Submit via email
        </a>
        <p className="mt-3 text-xs text-subtle">
          The template fills in automatically. Submissions are reviewed by a
          human before they appear — keep it safe for everyone, including
          kids wandering the worlds.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        The worlds and their zones
      </h2>
      <div className="mt-5 space-y-4">
        {worlds.map((world) => (
          <div
            key={world.slug}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold tracking-tight">
                {world.emblem} {world.name}
              </h3>
              <Link
                href={`/worlds/${world.slug}`}
                className="shrink-0 text-xs text-accent hover:underline"
              >
                Visit →
              </Link>
            </div>
            <p className="mt-2 text-sm text-muted">
              {world.zones.map((z) => z.name).join(" · ")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold tracking-tight">House rules</h2>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
          <li>— It must be live and working (we click everything)</li>
          <li>— No paywalls to try the basic thing</li>
          <li>— Family-friendly on arrival — kids explore these worlds too</li>
          <li>— You built it (with AI is the whole point — solo isn&apos;t required, credit your team)</li>
        </ul>
      </div>
    </div>
  );
}
