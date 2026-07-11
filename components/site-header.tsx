import Link from "next/link";

const nav = [
  { href: "/guides", label: "Guides" },
  { href: "/pulse", label: "Pulse" },
  { href: "/programs", label: "Credits & Programs" },
  { href: "/about", label: "About" },
];

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
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
