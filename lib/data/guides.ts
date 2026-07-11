import type { Guide } from "@/lib/types";

export const guides: Guide[] = [
  {
    slug: "vibe-coding-101",
    title: "Vibe Coding 101: From Idea to Working App",
    category: "Getting Started",
    difficulty: "Beginner",
    summary:
      "What vibe coding actually is, how the workflow differs from traditional programming, and a repeatable loop for turning an idea into a running app with an AI agent doing the typing.",
    readingMinutes: 9,
    updated: "2026-07-11",
    takeaways: [
      "You direct, the AI types — your job is intent, judgment, and verification",
      "Work in small, testable steps instead of one giant prompt",
      "Always run the app before asking for the next feature",
      "Version control is your undo button — commit every time something works",
    ],
    sections: [
      {
        heading: "What vibe coding is (and isn't)",
        paragraphs: [
          "Vibe coding is building software by describing what you want in plain language and letting an AI coding agent write, run, and revise the code. You stay in the driver's seat: you decide what to build, judge whether it works, and steer when it drifts. The AI handles syntax, boilerplate, and the mechanical parts of programming.",
          "It is not magic, and it is not zero-effort. The people who ship real products this way treat the AI like a very fast junior developer: they give clear instructions, review the output, and test constantly. The skill ceiling moved — from memorizing syntax to communicating intent and exercising judgment.",
        ],
      },
      {
        heading: "The core loop",
        paragraphs: [
          "Every productive vibe coding session runs the same loop. Master this and the tools almost don't matter:",
        ],
        bullets: [
          "Describe one small thing you want (a page, a button, a behavior)",
          "Let the agent build it",
          "Run the app and actually try it",
          "If it works, commit. If it doesn't, paste the error or describe what you saw",
          "Repeat",
        ],
      },
      {
        heading: "Start with a one-page spec",
        paragraphs: [
          "Before you open any tool, write a few sentences answering: Who is this for? What is the one thing it must do? What does 'done' look like for version one? Keep version one embarrassingly small — a single page that does one thing well beats a half-broken platform.",
          "Give that spec to the agent as your first message and ask it to propose a plan before writing code. Reviewing a plan takes one minute; untangling a wrong architecture takes a weekend.",
        ],
      },
      {
        heading: "Small steps beat big prompts",
        paragraphs: [
          "The most common beginner mistake is the mega-prompt: 'Build me a social network with profiles, feeds, messaging, and payments.' The agent will produce a lot of code, most of it untested, and you'll have no idea where the bugs live.",
          "Instead, sequence features: get a homepage rendering, then a form working, then data saving, then log-in. Each step is verifiable in seconds, and when something breaks you know exactly which change caused it.",
        ],
      },
      {
        heading: "Commit every win",
        paragraphs: [
          "Ask your agent to set up git in the first session and commit after every working step. When (not if) a later change breaks things, you can say 'revert to the last commit' and lose minutes instead of hours. Every serious vibe coder treats version control as their save-game system.",
        ],
        code: {
          language: "bash",
          label: "The three commands worth knowing",
          snippet:
            'git add -A && git commit -m "checkpoint: signup form works"\ngit log --oneline   # see your save points\ngit checkout .      # discard uncommitted changes',
        },
      },
    ],
  },
  {
    slug: "write-prompts-that-ship",
    title: "How to Write Prompts That Actually Ship Features",
    category: "Prompting",
    difficulty: "Beginner",
    summary:
      "Spec-first prompting for coding agents: how to phrase requests so you get working features instead of plausible-looking code that falls apart on the second click.",
    readingMinutes: 8,
    updated: "2026-07-11",
    takeaways: [
      "State the goal, the constraints, and what 'done' means — in that order",
      "Include real error messages and real examples, not paraphrases",
      "Ask for a plan first on anything non-trivial",
      "Tell the agent what NOT to touch",
    ],
    sections: [
      {
        heading: "Anatomy of a good coding prompt",
        paragraphs: [
          "A prompt that ships has three parts: the goal (what you want to exist), the context (what already exists and what constraints apply), and the acceptance test (how you'll both know it works). Most bad outcomes trace back to a missing third part — if you can't say what 'working' looks like, the agent can't either.",
        ],
        code: {
          language: "text",
          label: "Template",
          snippet:
            "Goal: Add a waitlist signup form to the homepage.\nContext: Next.js app, Tailwind, no database yet — store emails in a `signups` table via the existing Supabase client in lib/db.ts.\nDone when: I can submit an email, see a success message, and see the row in Supabase. Invalid emails show an inline error.",
        },
      },
      {
        heading: "Paste, don't paraphrase",
        paragraphs: [
          "When something breaks, copy the entire error message — stack trace and all — into the chat. Agents are extremely good at reading tracebacks and extremely bad at guessing from 'it says something about undefined.' The same goes for design intent: paste a screenshot or a link to a site whose layout you want, rather than describing it from memory.",
        ],
      },
      {
        heading: "Plan first for anything with moving parts",
        paragraphs: [
          "For features that touch more than one file — auth, payments, data models — ask the agent to lay out its plan before writing code: which files change, what new dependencies appear, what could break. You'll catch wrong assumptions when they're free to fix. Most coding agents have a dedicated plan mode for exactly this.",
        ],
      },
      {
        heading: "Set boundaries",
        paragraphs: [
          "Agents are eager. Left unguided, they'll 'improve' code you didn't ask about, rename things, and reformat files, making changes hard to review. Add guardrails to your prompts: 'Only modify the checkout page. Don't touch the auth code. Don't add new dependencies without asking.' Most tools also support a project instructions file (like AGENTS.md or CLAUDE.md) where you can set these rules once.",
        ],
      },
      {
        heading: "When output goes sideways, reset — don't argue",
        paragraphs: [
          "If you're three corrections deep and the agent keeps digging, stop. Long troubleshooting threads fill the context with failed attempts, and the agent starts pattern-matching on its own mistakes. Revert to your last commit, start a fresh conversation, and re-state the goal with what you learned: 'Last attempt failed because X. This time, do Y instead.'",
        ],
      },
    ],
  },
  {
    slug: "choose-your-ai-stack",
    title: "Choosing Your AI Coding Stack in 2026",
    category: "Tooling",
    difficulty: "Beginner",
    summary:
      "Agentic CLIs, AI-first editors, and app generators each shine at different jobs. How to pick the right tool for your project and skill level — and why most builders end up using two.",
    readingMinutes: 10,
    updated: "2026-07-11",
    takeaways: [
      "App generators are fastest from zero; agentic tools are strongest for real, evolving codebases",
      "Pick one primary tool and learn it deeply before collecting more",
      "Your stack choice matters less than your workflow discipline",
      "Prototype in a generator, graduate to an agent + editor as the app grows",
    ],
    sections: [
      {
        heading: "The three tool families",
        paragraphs: [
          "Every AI coding tool falls roughly into one of three families, and knowing which family you're in explains most of the experience:",
        ],
        bullets: [
          "App generators (v0, Lovable, Bolt, Replit): describe an app in the browser, get a running full-stack prototype in minutes. Fastest zero-to-demo; least control as complexity grows.",
          "AI-first editors (Cursor, Windsurf, VS Code + Copilot): a familiar code editor with an agent inside. Great middle ground when you want to see and occasionally touch the code.",
          "Agentic CLIs and cloud agents (Claude Code, Codex, Jules, Devin): you converse, the agent works across your whole repo — running commands, editing many files, opening pull requests. Strongest for real projects, multi-step tasks, and automation.",
        ],
      },
      {
        heading: "Match the tool to the job",
        paragraphs: [
          "Building a landing page or validating an idea this afternoon? A generator gets you a deployed prototype before an editor finishes installing. Building something you'll maintain for months, with a real database and real users? You want an agentic tool working in a real git repository, where you can review diffs, run tests, and roll back.",
          "A common and effective path: prototype in a generator, export or recreate the project in a proper repo, then continue with an agentic CLI or AI editor. Treat the generator output as a sketch, not a foundation.",
        ],
      },
      {
        heading: "What actually differentiates tools",
        paragraphs: [
          "Model quality converges fast; workflow is where tools differ. When evaluating, ignore benchmark noise and check: Can it run your app and see the errors? Can it work across many files in one task? Does it integrate with git and GitHub? Can you give it standing project instructions? Does it support extensions like MCP servers for connecting external services? Those capabilities decide your daily experience far more than a few points on a leaderboard.",
        ],
      },
      {
        heading: "A sane default stack for new builders",
        paragraphs: [
          "If you want a no-decision starting point that scales from toy to production: Next.js or a similar full-stack framework, Supabase or another managed Postgres for data and auth, GitHub for version control, Vercel or Railway for hosting, and one agentic coding tool driving it all. Every piece has generous free tiers, huge communities, and — because they're popular — the AI models know them extremely well, which measurably improves generated code quality.",
        ],
      },
    ],
  },
  {
    slug: "ship-your-first-app",
    title: "Shipping: Deploy Your Vibe-Coded App to the Internet",
    category: "Shipping",
    difficulty: "Intermediate",
    summary:
      "Local apps don't count. How to get your project deployed on Vercel, Railway, or Cloudflare with a real domain, environment variables handled safely, and a deploy pipeline that updates on every push.",
    readingMinutes: 9,
    updated: "2026-07-11",
    takeaways: [
      "Deploy early — a live URL from week one keeps deploys boring",
      "Connect GitHub to your host so every push auto-deploys",
      "Environment variables live in your host's dashboard, never in code",
      "Test the production build locally before you debug it in the cloud",
    ],
    sections: [
      {
        heading: "Deploy before you're 'ready'",
        paragraphs: [
          "The single best shipping habit is deploying in week one, when the app barely does anything. Deploys fail on configuration — environment variables, build commands, framework versions — and those problems are much easier to solve when the app is tiny. From then on, every push is a small, low-stakes update instead of a terrifying launch day.",
        ],
      },
      {
        heading: "Picking a host",
        paragraphs: [
          "For a typical vibe-coded web app, three hosts cover nearly everyone. Vercel is the smoothest for Next.js — connect your GitHub repo and it deploys on every push with zero config. Railway is the pick when your app is more than a website: background workers, databases, and long-running servers deploy as easily as the frontend. Cloudflare offers a very generous free tier and shines for global, high-traffic apps on Workers.",
          "All three follow the same pattern: sign in with GitHub, select the repo, set environment variables, deploy. Your AI agent can walk you through host-specific configuration — just tell it which host you chose.",
        ],
      },
      {
        heading: "Environment variables and secrets",
        paragraphs: [
          "API keys, database URLs, and other secrets must never be committed to your repository. Locally they live in a .env file that's listed in .gitignore; in production you enter them in your host's dashboard. If a key does end up in a commit, treat it as leaked: rotate it (generate a new one) rather than just deleting the file — the old value lives on in git history.",
        ],
        code: {
          language: "bash",
          label: "Check before your first push",
          snippet:
            "# .env must appear in .gitignore\ncat .gitignore | grep .env\n\n# and must not be tracked\ngit ls-files | grep -i .env   # should print nothing",
        },
      },
      {
        heading: "When the deploy fails but local works",
        paragraphs: [
          "The classic gap: development mode is forgiving, production builds are strict. Run your framework's production build locally (for Next.js, `npm run build`) before pushing — it surfaces the type errors and missing variables the deploy would hit. When a cloud build fails, paste the full deploy log into your agent; build logs are among the things AI debugs best.",
        ],
      },
      {
        heading: "Domains and the finish line",
        paragraphs: [
          "Every host gives you a free subdomain, which is fine for testing. A custom domain costs about $10/year, takes ten minutes to connect in your host's dashboard, and instantly makes the project feel — and look — real. HTTPS is automatic on all the hosts above. After that, your ship checklist is short: production build passes, secrets are in the dashboard, the live URL works on your phone, and you've clicked every button on the deployed site once.",
        ],
      },
    ],
  },
  {
    slug: "debug-ai-code",
    title: "Debugging AI-Generated Code (and Unsticking Stuck Agents)",
    category: "Tooling",
    difficulty: "Intermediate",
    summary:
      "What to do when the app breaks and the agent's fixes make it worse: a triage playbook for reading errors, isolating causes, rolling back, and getting the agent working for you again.",
    readingMinutes: 8,
    updated: "2026-07-11",
    takeaways: [
      "The error message is data — feed the whole thing to the agent",
      "Make the agent prove its fix: 'run it and show me the output'",
      "Two failed fixes in a row = revert and re-approach, don't keep patching",
      "Ask the agent to add logging or tests when a bug is invisible",
    ],
    sections: [
      {
        heading: "Triage: what kind of broken is it?",
        paragraphs: [
          "Bugs in AI-built apps come in three flavors, each with a different move. Loud failures (error screens, crashed builds) are the easy ones — copy the full error into the agent. Quiet failures (the button does nothing, data doesn't save) need observability first: ask the agent to add console logging around the failing path, then report what the logs say. Wrong-behavior failures (it works, but not how you wanted) are specification problems — the fix is a clearer description of the intended behavior, not more debugging.",
        ],
      },
      {
        heading: "Make the agent verify, not just claim",
        paragraphs: [
          "Agents optimize for looking done. 'Fixed!' is a claim, not evidence. Close the gap by demanding verification in the same breath as the fix: 'Fix the signup error, then run the app, submit the form, and show me the server output.' Agentic tools that can run commands will actually do this — and catch their own failed fixes before you have to.",
        ],
      },
      {
        heading: "The two-strike revert rule",
        paragraphs: [
          "If two consecutive fix attempts fail, stop the patch spiral. Each failed fix layers new code on a wrong theory, and the codebase drifts further from working. Revert to your last good commit and re-approach fresh: describe the original goal plus what you now know ('the crash happens only for logged-out users'), and let the agent try a clean path. This feels slower; it is dramatically faster.",
        ],
      },
      {
        heading: "Shrink the haystack",
        paragraphs: [
          "When the agent can't find a bug, narrow where it looks. Good narrowing prompts: 'The bug appeared after the last commit — diff it and look there.' 'It works in Chrome but not Safari.' 'It fails only with an empty cart.' Each constraint eliminates most of the codebase from suspicion. You're not writing the fix — you're doing the detective work only someone who can see the app running can do.",
        ],
      },
      {
        heading: "Let tests do the remembering",
        paragraphs: [
          "The bug you fixed has a habit of coming back three features later. Once anything important works — signup, checkout, saving — ask the agent to write automated tests for it, and to run the test suite after every change. You don't need to read the tests. You need the agent to get caught the moment it breaks something that used to work.",
        ],
      },
    ],
  },
  {
    slug: "vibe-coding-security-basics",
    title: "Security Basics Every Vibe Coder Needs",
    category: "Safety",
    difficulty: "Intermediate",
    summary:
      "AI-generated apps ship with predictable security holes. The five that actually get exploited — leaked keys, missing server-side checks, open databases, injection, and no rate limits — and the prompts that close them.",
    readingMinutes: 9,
    updated: "2026-07-11",
    takeaways: [
      "Never trust the client — every check must also happen on the server",
      "Secrets belong in environment variables; rotate any key that touches git",
      "Turn on row-level security before real users touch your database",
      "Ask your agent to audit its own code — it finds what it missed",
    ],
    sections: [
      {
        heading: "Why AI-built apps get popped",
        paragraphs: [
          "AI agents write code that works in the demo. Security is precisely the stuff that doesn't show up in a demo — what happens when someone sends a request your UI would never send. Attackers know a wave of AI-built apps is live with default configurations, and they scan for them automatically. The good news: the same agent that created the holes can close them, if you ask.",
        ],
      },
      {
        heading: "1. Leaked API keys",
        paragraphs: [
          "The most common breach, and the most expensive when it's a pay-per-use AI key. Two rules cover it: secrets live only in environment variables (never in source files), and any key that was ever committed to git gets rotated, not deleted — history preserves it forever. Also make sure keys are only used in server-side code; anything in frontend code ships to every visitor's browser.",
        ],
      },
      {
        heading: "2. Client-side-only checks",
        paragraphs: [
          "Hiding the admin button doesn't protect the admin action — anyone can call your API directly with browser dev tools or curl. Every permission check, price calculation, and quota must be enforced in server code. This is the #1 logic hole in generated apps because the agent 'sees' the app through the UI, just like a polite user would.",
        ],
        code: {
          language: "text",
          label: "The audit prompt",
          snippet:
            "Review every API route in this app. For each one, tell me:\n1. What stops a logged-out user from calling it directly?\n2. What stops user A from reading or editing user B's data?\nFix anything that relies on the frontend for enforcement.",
        },
      },
      {
        heading: "3. Open databases",
        paragraphs: [
          "Managed databases like Supabase are wonderful, but their client libraries talk to the database directly from the browser — which means the database's own rules are your security. Enable row-level security (RLS) on every table and write policies so users can only read and write their own rows. Supabase warns you about tables with RLS off; treat every warning as a fire.",
        ],
      },
      {
        heading: "4. Injection and unvalidated input",
        paragraphs: [
          "Any text a user submits should be treated as hostile: validated on the server, parameterized in database queries (never string-concatenated), and escaped when displayed. Modern frameworks and ORMs handle most of this by default — the danger zone is custom SQL and raw HTML rendering, both things agents occasionally reach for. A one-line prompt — 'check this app for injection risks and unsafe HTML rendering' — is cheap insurance.",
        ],
      },
      {
        heading: "5. No rate limits",
        paragraphs: [
          "Without rate limiting, one script can sign up ten thousand fake users, hammer your login with password guesses, or burn your entire AI API budget overnight. Ask your agent to add rate limiting to auth endpoints and anything that costs you money per call. If you're on Vercel, Cloudflare, or similar, much of this is a platform feature you just have to turn on.",
        ],
      },
    ],
  },
  {
    slug: "add-ai-features",
    title: "Adding AI Features to Your App",
    category: "Shipping",
    difficulty: "Advanced",
    summary:
      "Go beyond building WITH AI to building AI INTO your product: calling model APIs from your backend, streaming responses, controlling costs, and using open models from Hugging Face.",
    readingMinutes: 10,
    updated: "2026-07-11",
    takeaways: [
      "Model calls go through your backend — never expose API keys to the browser",
      "Start with the cheapest model that works; upgrade only when quality demands it",
      "Stream responses so users see progress instead of a spinner",
      "Set spending limits before launch, not after the surprise bill",
    ],
    sections: [
      {
        heading: "The shape of every AI feature",
        paragraphs: [
          "Chatbots, summarizers, image describers, smart search — under the hood they're all the same three steps: your server receives user input, sends it to a model API with instructions (the system prompt), and returns the result. Your agent can scaffold this in minutes. The design work is deciding what instructions, what model, and what to do when output is wrong — because sometimes it will be.",
        ],
      },
      {
        heading: "Keys stay server-side, always",
        paragraphs: [
          "AI API keys are money. A key shipped in frontend code will be extracted and abused — automated scanners find them within hours. The pattern that keeps you safe: the browser calls your own API route, your server (where the key lives in an environment variable) calls the model provider, and your server enforces who can call it and how often.",
        ],
        code: {
          language: "ts",
          label: "Minimal Next.js route calling Claude",
          snippet:
            'import Anthropic from "@anthropic-ai/sdk";\n\nconst anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY env var\n\nexport async function POST(req: Request) {\n  const { question } = await req.json();\n  const msg = await anthropic.messages.create({\n    model: "claude-sonnet-5",\n    max_tokens: 1024,\n    messages: [{ role: "user", content: question }],\n  });\n  return Response.json({ answer: msg.content });\n}',
        },
      },
      {
        heading: "Pick models by job, not by hype",
        paragraphs: [
          "Providers ship model families at different price points: small fast models (great for classification, extraction, autocomplete), mid-tier models (most chat and summarization), and frontier models (complex reasoning and coding). Costs differ by 10–50x between tiers. Start every feature on the cheapest tier and move up only when you can point at outputs that aren't good enough — most features are surprisingly happy on small models.",
        ],
      },
      {
        heading: "Open models and Hugging Face",
        paragraphs: [
          "Hugging Face hosts hundreds of thousands of open models you can run without per-token API pricing — via its Inference Providers, dedicated endpoints, or your own GPU. Open-weight models are the budget play for high-volume, well-defined tasks (embeddings, moderation, transcription) and the only play when data can't leave your infrastructure. Browsing trending models and Spaces is also the fastest way to see what's newly possible — demos usually appear there first.",
        ],
      },
      {
        heading: "Costs, limits, and not going viral into bankruptcy",
        paragraphs: [
          "Per-token pricing means your bill scales with usage — including malicious usage. Before launch: set a monthly spending cap in your provider's console, rate-limit your AI endpoints per user, cap input length (someone will paste a novel), and log usage per user so you can spot abuse. Caching identical requests and trimming bloated prompts routinely cuts bills in half.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
