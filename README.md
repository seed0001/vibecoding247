# Vibe Coding 24/7

A structured online school for AI-assisted software development — live at
[vibecoding247.net](https://vibecoding247.net).

An immersive, game-style learning platform for vibe coding. Byte, the AI
guide character, greets each visitor on the landing page, asks their age
group and AI knowledge level, and recommends a learning path. Underneath the
game layer is a real sequenced curriculum (modules, lessons, objectives) and
a live class schedule for workshops, code reviews, and office hours.
Learner profiles are stored client-side in localStorage for now.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS 4
- No database yet — course and schedule content lives in typed data files
  (see below), designed to be swapped for a database without touching pages.

## Project structure

```
app/
  page.tsx                                  Home (hero, curriculum, upcoming classes)
  courses/page.tsx                          Course catalog
  courses/[slug]/page.tsx                   Course detail + syllabus
  courses/[slug]/lessons/[lessonSlug]/      Individual lesson pages
  schedule/page.tsx                         Live class schedule
  about/page.tsx                            About the school
  api/health/route.ts                       Health check (used by Railway)
  sitemap.ts, robots.ts                     SEO
components/                                 Header, footer, cards, badges
lib/
  types.ts                                  Course / Module / Lesson / LiveSession types
  data/courses.ts                           Curriculum content
  data/sessions.ts                          Live class schedule content
  data/instructors.ts                       Instructor profiles
railway.json                                Railway build/deploy config
```

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

- Student accounts and enrollment
- Session registration and calendar invites for live classes
- Lesson content delivery (video, readings, exercises) — lesson pages
  currently show objectives and outlines only
- Instructor profiles and a real faculty roster
- Database-backed content management (replace `lib/data/*`)
