import Link from "next/link";

const nav = [
  { href: "/guides", label: "Guides" },
  { href: "/pulse", label: "Pulse" },
  { href: "/programs", label: "Credits & Programs" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Vibe Coding <span className="text-rainbow">24/7</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm font-semibold">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-accent-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
