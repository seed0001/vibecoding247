import Link from "next/link";
import { worlds } from "@/lib/data/worlds";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight"
        >
          Vibe Coding
          <span className="font-mono text-sm font-medium text-accent">
            24/7
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {worlds.map((world) => (
            <Link
              key={world.slug}
              href={`/worlds/${world.slug}`}
              className="hidden text-muted transition-colors hover:text-foreground lg:inline"
              title={world.name}
            >
              {world.emblem}
            </Link>
          ))}
          <Link
            href="/submit"
            className="rounded-md bg-accent-strong px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Submit your app
          </Link>
        </nav>
      </div>
    </header>
  );
}
