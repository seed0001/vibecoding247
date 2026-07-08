import Link from "next/link";

const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/schedule", label: "Live Classes" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Vibe Coding <span className="text-accent">24/7</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium">
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
