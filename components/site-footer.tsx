import Link from "next/link";

const siteLinks = [
  { href: "/submit", label: "Submit your app" },
  { href: "/pulse", label: "Pulse" },
  { href: "/programs", label: "Credits & Programs" },
  { href: "/guides", label: "Guides" },
  { href: "/first-steps", label: "First Steps" },
  { href: "/about", label: "About" },
];

const externalLinks = [
  { href: "https://github.com/trending", label: "GitHub Trending" },
  { href: "https://huggingface.co/models", label: "Hugging Face Models" },
  { href: "https://www.reddit.com/r/vibecoding/", label: "r/vibecoding" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight">
              Vibe Coding
              <span className="font-mono text-sm font-medium text-accent">
                24/7
              </span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-subtle">
              A hub of navigable 3D worlds where builders submit and share
              what they&apos;ve made.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Site
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Community
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-subtle">
          © {new Date().getFullYear()} Vibe Coding 24/7. Program details change
          — verify offers on the provider&apos;s official page.
        </p>
      </div>
    </footer>
  );
}
