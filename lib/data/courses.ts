import type { Course } from "@/lib/types";

export const courses: Course[] = [
  {
    slug: "vibe-coding-foundations",
    title: "Vibe Coding Foundations",
    level: "Foundations",
    description:
      "A structured introduction to AI-assisted software development. Learn to describe intent precisely, direct an AI coding agent through a real project, and evaluate the code it produces.",
    outcomes: [
      "Write clear, unambiguous prompts that produce working code on the first pass",
      "Break a project idea into tasks an AI agent can execute reliably",
      "Read and evaluate generated code well enough to catch obvious errors",
      "Ship a small working web application from scratch",
    ],
    prerequisites: ["None. This course assumes no programming background."],
    instructor: "staff",
    modules: [
      {
        title: "Orientation: How AI Coding Actually Works",
        description:
          "What language models can and cannot do, what a coding agent is, and how to set up a working environment.",
        lessons: [
          {
            slug: "what-is-vibe-coding",
            title: "What Is Vibe Coding?",
            summary:
              "Definitions, history, and the difference between autocomplete, chat assistants, and autonomous coding agents.",
            durationMinutes: 45,
            objectives: [
              "Define vibe coding and distinguish it from traditional development",
              "Identify the major categories of AI coding tools",
              "Understand where human judgment remains essential",
            ],
            outline: [
              "Origins of the term and how the practice evolved",
              "Tool landscape: completions, chat, agents",
              "The developer's changing role",
              "Course roadmap and expectations",
            ],
          },
          {
            slug: "setting-up-your-environment",
            title: "Setting Up Your Environment",
            summary:
              "Install and configure the tools used throughout the program: an editor, a terminal, git, and an AI coding agent.",
            durationMinutes: 60,
            objectives: [
              "Configure an editor and AI agent for daily work",
              "Initialize a git repository and make your first commit",
              "Run a project locally and understand the dev loop",
            ],
            outline: [
              "Editor and agent installation",
              "Terminal fundamentals for non-programmers",
              "Git in fifteen minutes",
              "Running your first generated project",
            ],
          },
        ],
      },
      {
        title: "Directing the Agent",
        description:
          "The core skill: turning intent into instructions that produce correct software.",
        lessons: [
          {
            slug: "writing-effective-prompts",
            title: "Writing Effective Prompts",
            summary:
              "Structure, specificity, and context. Why 'make it better' fails and what to say instead.",
            durationMinutes: 60,
            objectives: [
              "Apply a repeatable structure to coding prompts",
              "Provide context that constrains the agent toward correct output",
              "Iterate on a prompt when the first result misses",
            ],
            outline: [
              "Anatomy of a good coding prompt",
              "Context: what the agent needs to know",
              "Common failure modes and fixes",
              "Live exercise: same task, five prompts",
            ],
          },
          {
            slug: "from-idea-to-task-list",
            title: "From Idea to Task List",
            summary:
              "Decomposing a project into a sequence of small, verifiable steps before writing a single prompt.",
            durationMinutes: 60,
            objectives: [
              "Break a feature into agent-sized tasks",
              "Order tasks so each one is verifiable",
              "Recognize when a task is too large for one pass",
            ],
            outline: [
              "Why decomposition matters more with AI",
              "The task-list method",
              "Verification checkpoints",
              "Workshop: decompose a real app idea",
            ],
          },
          {
            slug: "reading-generated-code",
            title: "Reading Generated Code",
            summary:
              "You don't have to write code to evaluate it. A practical framework for reviewing what the agent produced.",
            durationMinutes: 75,
            objectives: [
              "Trace the flow of a generated program at a high level",
              "Spot red flags: dead code, silent failures, hardcoded values",
              "Ask the agent the right questions about its own output",
            ],
            outline: [
              "Reading for structure, not syntax",
              "The red-flag checklist",
              "Using the agent to explain its work",
              "Exercise: find the planted bugs",
            ],
          },
        ],
      },
      {
        title: "Shipping",
        description:
          "Taking a working project from your machine to a public URL.",
        lessons: [
          {
            slug: "testing-what-you-built",
            title: "Testing What You Built",
            summary:
              "Manual verification, automated tests written by the agent, and knowing when something is actually done.",
            durationMinutes: 60,
            objectives: [
              "Verify features end-to-end before calling them complete",
              "Direct the agent to write and run automated tests",
              "Build a personal definition of done",
            ],
            outline: [
              "Manual testing discipline",
              "Agent-written tests: strengths and limits",
              "The definition-of-done checklist",
            ],
          },
          {
            slug: "deploying-to-production",
            title: "Deploying to Production",
            summary:
              "Domains, hosting platforms, environment variables, and the deploy-verify loop. Capstone: ship your project live.",
            durationMinutes: 90,
            objectives: [
              "Deploy a web application to a hosting platform",
              "Connect a custom domain",
              "Diagnose a failed deploy with the agent's help",
            ],
            outline: [
              "Hosting landscape overview",
              "Environment configuration and secrets",
              "The deploy-verify loop",
              "Capstone: ship it",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "spec-driven-development",
    title: "Spec-Driven Development with AI",
    level: "Intermediate",
    description:
      "Move beyond conversational prompting. Write specifications that let an AI agent build entire features autonomously — and verify the result systematically.",
    outcomes: [
      "Write feature specifications an agent can implement without back-and-forth",
      "Design acceptance criteria that double as verification steps",
      "Manage multi-file changes and larger codebases with an agent",
      "Establish a repeatable spec → build → verify workflow",
    ],
    prerequisites: [
      "Vibe Coding Foundations or equivalent experience directing an AI coding agent",
    ],
    instructor: "staff",
    modules: [
      {
        title: "Specifications as the New Source Code",
        description:
          "Why the spec is becoming the primary artifact, and how to write one well.",
        lessons: [
          {
            slug: "anatomy-of-a-spec",
            title: "Anatomy of a Spec",
            summary:
              "Goals, constraints, edge cases, and acceptance criteria — the four sections every implementable spec needs.",
            durationMinutes: 60,
            objectives: [
              "Structure a spec so an agent can implement it in one pass",
              "Write acceptance criteria that are objectively checkable",
              "Anticipate edge cases before implementation begins",
            ],
            outline: [
              "The four-section spec template",
              "Good and bad acceptance criteria",
              "Edge-case brainstorming techniques",
              "Exercise: spec a feature, trade specs, implement",
            ],
          },
          {
            slug: "scoping-and-constraints",
            title: "Scoping and Constraints",
            summary:
              "Telling the agent what not to do is as important as telling it what to do.",
            durationMinutes: 60,
            objectives: [
              "Set explicit boundaries on an implementation task",
              "Prevent scope creep in agent-generated changes",
              "Constrain technology and pattern choices deliberately",
            ],
            outline: [
              "Negative constraints and guardrails",
              "Reviewing diffs for scope creep",
              "Pattern and dependency policies",
            ],
          },
        ],
      },
      {
        title: "Working at Scale",
        description:
          "Larger codebases, longer-running tasks, and keeping quality high across many agent sessions.",
        lessons: [
          {
            slug: "codebase-context-management",
            title: "Codebase Context Management",
            summary:
              "Project documentation files, conventions, and structure that make every future agent session more effective.",
            durationMinutes: 75,
            objectives: [
              "Write project-level context files that agents actually use",
              "Organize a codebase for agent legibility",
              "Maintain conventions across many generated changes",
            ],
            outline: [
              "Agent-facing documentation",
              "Repository structure for legibility",
              "Convention drift and how to stop it",
            ],
          },
          {
            slug: "verification-workflows",
            title: "Verification Workflows",
            summary:
              "Tests, linting, type checks, and review passes arranged into a pipeline that catches agent mistakes automatically.",
            durationMinutes: 75,
            objectives: [
              "Assemble an automated verification pipeline",
              "Use one agent session to review another's work",
              "Decide what still requires human review",
            ],
            outline: [
              "The verification stack",
              "Agent-on-agent code review",
              "The human review budget",
              "Workshop: harden a real pipeline",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "production-systems-with-ai",
    title: "Building Production Systems with AI",
    level: "Advanced",
    description:
      "Databases, authentication, payments, monitoring, and operations — building real products with AI assistance while maintaining professional standards for security and reliability.",
    outcomes: [
      "Design and ship a production application with real users and real data",
      "Apply security fundamentals to AI-generated code",
      "Set up monitoring, backups, and an incident response habit",
      "Evaluate architectural decisions the agent proposes",
    ],
    prerequisites: [
      "Spec-Driven Development with AI, or professional software experience plus agent fluency",
    ],
    instructor: "staff",
    modules: [
      {
        title: "Data and Identity",
        description: "The two systems you cannot afford to get wrong.",
        lessons: [
          {
            slug: "databases-and-migrations",
            title: "Databases and Migrations",
            summary:
              "Schema design, migration discipline, and directing an agent safely around production data.",
            durationMinutes: 90,
            objectives: [
              "Review agent-proposed schemas critically",
              "Run migrations without losing data",
              "Establish rules for agent access to production systems",
            ],
            outline: [
              "Schema review fundamentals",
              "Migration workflows and rollback plans",
              "Production data guardrails",
            ],
          },
          {
            slug: "authentication-done-right",
            title: "Authentication Done Right",
            summary:
              "Sessions, OAuth, and the security mistakes AI-generated auth code makes most often.",
            durationMinutes: 90,
            objectives: [
              "Choose an appropriate auth strategy for a product",
              "Audit generated auth code against a security checklist",
              "Handle secrets and tokens correctly",
            ],
            outline: [
              "Auth strategy selection",
              "The generated-auth security checklist",
              "Secrets management",
              "Lab: break and fix a vulnerable auth flow",
            ],
          },
        ],
      },
      {
        title: "Operating in Production",
        description: "What happens after launch.",
        lessons: [
          {
            slug: "monitoring-and-incident-response",
            title: "Monitoring and Incident Response",
            summary:
              "Logs, alerts, uptime checks, and using an AI agent as your first responder when something breaks at 3 a.m.",
            durationMinutes: 75,
            objectives: [
              "Instrument an application with useful logging and alerts",
              "Run a structured incident response with agent assistance",
              "Write a postmortem that prevents recurrence",
            ],
            outline: [
              "The minimum viable observability stack",
              "Agent-assisted debugging under pressure",
              "Postmortem practice",
            ],
          },
          {
            slug: "cost-performance-and-scale",
            title: "Cost, Performance, and Scale",
            summary:
              "Finding bottlenecks, controlling infrastructure spend, and knowing when scaling advice from an agent is wrong.",
            durationMinutes: 75,
            objectives: [
              "Profile an application and identify real bottlenecks",
              "Estimate and control monthly infrastructure cost",
              "Stress-test agent-proposed scaling plans",
            ],
            outline: [
              "Measurement before optimization",
              "Cost anatomy of a small production app",
              "Scaling myths and realities",
              "Capstone review",
            ],
          },
        ],
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getLesson(courseSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return { course, module: mod, lesson };
  }
  return undefined;
}
