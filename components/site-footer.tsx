import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">Vibe Coding 24/7</p>
          <p className="mt-1">
            Structured education for AI-assisted software development.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link href="/courses" className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <Link href="/schedule" className="transition-colors hover:text-foreground">
            Live Classes
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
