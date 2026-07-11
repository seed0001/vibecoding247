import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-foreground">Vibe Coding 24/7</p>
          <p className="mt-1">
            How-tos, trends, and builder credits for the AI coding community. ✦
          </p>
        </div>
        <nav className="flex flex-wrap gap-6">
          <Link href="/guides" className="transition-colors hover:text-accent-2">
            Guides
          </Link>
          <Link href="/pulse" className="transition-colors hover:text-accent-2">
            Pulse
          </Link>
          <Link
            href="/programs"
            className="transition-colors hover:text-accent-2"
          >
            Credits & Programs
          </Link>
          <Link href="/about" className="transition-colors hover:text-accent-2">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
