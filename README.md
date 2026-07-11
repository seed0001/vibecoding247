# Vibe Coding 24/7

An informational, educational, community-driven hub for AI builders — live at
[vibecoding247.net](https://vibecoding247.net).

Three pillars:

1. **How-To Guides** (`/guides`) — practical walkthroughs for vibe coding and
   app building: prompting, tooling, shipping, debugging, and security.
2. **The Pulse** (`/pulse`) — a curated trend radar plus live feeds of
   trending AI repos on GitHub and trending models on Hugging Face
   (refreshed hourly via ISR, with curated fallbacks if the APIs are
   unreachable), and a directory of community hangouts.
3. **Credits & Programs** (`/programs`) — a verified directory of partnership
   and outreach programs offering builder credits: cloud credits, model API
   credits, GPU grants, and student packs, each with eligibility notes,
   application links, and a last-verified date.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS 4
- No database — all editorial content lives in typed data files (see below),
  designed to be swapped for a CMS or database without touching pages. Live
  trend data comes from the public GitHub and Hugging Face APIs at request
  time.

## Project structure

```
app/
  page.tsx                    Home (hero, pillars, featured guides, radar preview)
  guides/page.tsx             Guide index, grouped by category
  guides/[slug]/page.tsx      Guide articles (statically generated)
  pulse/page.tsx              Trend radar + live GitHub/HF feeds (ISR, 1h)
  programs/page.tsx           Credits & partnership program directory
  about/page.tsx              Mission and how the community drives content
  api/health/route.ts         Health check (used by Railway)
  sitemap.ts, robots.ts       SEO
components/                   Header, footer, mascot, pills/badges
lib/
  types.ts                    Guide / TrendSignal / Program / highlight types
  data/guides.ts              Guide content
  data/pulse.ts               Trend radar, community spots, live-feed fallbacks
  data/programs.ts            Credits program directory (with verified dates)
  live.ts                     GitHub / Hugging Face fetchers (hourly revalidate)
railway.json                  Railway build/deploy config
```

## Editing content

All content is code-reviewed data, no CMS:

- Add a guide: append to `lib/data/guides.ts` — the index page, article page,
  and sitemap pick it up automatically.
- Update the trend radar: edit `trendSignals` in `lib/data/pulse.ts`.
- Add a credits program: append to `lib/data/programs.ts` and set the
  `verified` date to the day you checked the offer.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Deploying to Railway

1. Create a new Railway project from this GitHub repo. Railway auto-detects
   Next.js; `railway.json` sets the build/start commands and points the
   health check at `/api/health`. Next.js binds to Railway's `PORT`
   automatically.
2. Add the custom domain: in the service's **Settings → Networking**, add
   `vibecoding247.net` (and optionally `www.vibecoding247.net`), then create
   the CNAME record Railway shows you at your DNS provider. For the apex
   domain, use your DNS provider's CNAME-flattening/ALIAS record if plain
   CNAME isn't supported.

## Roadmap (not yet built)

- Community submissions (guide requests, program tips) beyond external links
- Newsletter / RSS for the Pulse
- Program application walkthroughs with screenshots
- Automated re-verification reminders for program listings
