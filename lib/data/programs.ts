import type { Program, ProgramCategory } from "@/lib/types";

/**
 * Builder credits & partnership programs. Offers change — every entry
 * links to the official page and carries the date we last verified it.
 */
export const programs: Program[] = [
  {
    slug: "microsoft-founders-hub",
    name: "Microsoft for Startups Founders Hub",
    provider: "Microsoft",
    category: "Cloud Credits",
    offer: "Up to $150,000 in Azure credits",
    description:
      "The most accessible big-cloud program: self-serve signup with no VC backing, accelerator, or even an incorporated company required to start. Credits unlock in tiers as you grow, starting with $1,000 instantly (plus $4,000 after verification). Bundles GitHub Enterprise, Microsoft 365, and access to a mentor network.",
    bestFor:
      "Solo builders and early teams who want meaningful cloud + AI credits without needing investors",
    eligibility: [
      "No VC backing or third-party validation required to start",
      "Valid Microsoft account with no prior Azure usage on it",
      "Higher tiers unlock with milestones or an investor referral code",
    ],
    applyUrl: "https://startups.microsoft.com",
    applyNotes:
      "Self-serve application; approval typically lands within about 3 business days.",
    verified: "2026-07-11",
  },
  {
    slug: "aws-activate",
    name: "AWS Activate",
    provider: "Amazon Web Services",
    category: "Cloud Credits",
    offer: "$1,000 (Founders) up to $200,000 (Portfolio) in AWS credits",
    description:
      "Two tiers: Activate Founders gives self-funded startups $1,000 in credits plus support and training; Activate Portfolio unlocks up to $200,000 for startups affiliated with a participating VC, accelerator, or incubator (via their Org ID). Credits apply across 200+ AWS services including AI infrastructure.",
    bestFor:
      "Builders already on AWS, and accelerator-backed teams who can access the Portfolio tier",
    eligibility: [
      "Founders tier: self-funded startups — apply directly",
      "Portfolio tier: affiliation with an Activate Provider and their Org ID",
      "Business-domain email required — applications from gmail/yahoo/hotmail are auto-rejected",
      "Company founded within the past 10 years",
    ],
    applyUrl: "https://aws.amazon.com/startups/credits/",
    applyNotes:
      "Create an AWS Builder ID with your business email; responses typically arrive in 5–10 business days.",
    verified: "2026-07-11",
  },
  {
    slug: "google-cloud-startups",
    name: "Google for Startups Cloud Program",
    provider: "Google Cloud",
    category: "Cloud Credits",
    offer: "Up to $200,000 in credits — $350,000 for AI-first startups",
    description:
      "Covers Google Cloud and Firebase costs over your first two years in the program, with the industry's largest published ceiling for AI-first startups building on Google's AI stack. Includes technical support, dedicated mentors, and startup community perks.",
    bestFor:
      "Funded startups building AI products, especially teams planning to use Google's AI models and infrastructure",
    eligibility: [
      "Early-stage startup, generally pre-Series A, with equity funding for the larger tiers",
      "AI-first tier is aimed at startups building AI as their core product",
      "Credits are valid for up to 2 years once accepted",
    ],
    applyUrl: "https://cloud.google.com/startup",
    applyNotes:
      "Apply on the program page; the AI-first track has its own application at cloud.google.com/startup/ai.",
    verified: "2026-07-11",
  },
  {
    slug: "anthropic-for-startups",
    name: "Claude for Startups",
    provider: "Anthropic",
    category: "AI & Model Credits",
    offer: "Claude API credits — commonly $1,000 to $25,000+, more via partners",
    description:
      "API credits, priority rate limits, and founder resources for startups building products on Claude. Larger allocations flow through Anthropic's VC and accelerator partners, but any early-stage founder can apply directly with a Console account and a short description of what they're building.",
    bestFor:
      "Startups shipping AI features on Claude who want free inference runway and higher rate limits",
    eligibility: [
      "Early-stage startup (typically founded within the last ~4 years)",
      "Claude Console account and a company email/website",
      "Larger credit tiers generally require affiliation with a partner VC or accelerator",
      "First-time recipients only",
    ],
    applyUrl: "https://claude.com/programs/startups",
    applyNotes:
      "Short application form; credits are valid for 12 months from issue.",
    verified: "2026-07-11",
  },
  {
    slug: "cloudflare-for-startups",
    name: "Cloudflare for Startups",
    provider: "Cloudflare",
    category: "Cloud Credits",
    offer: "Up to $250,000 in Cloudflare credits, tiered by stage",
    description:
      "Tiered credits ($10k to launch — no minimum funding required — scaling to six figures with account management and priority support) covering Workers, R2 storage, Workers AI, and the rest of Cloudflare's usage-based platform. Core security and networking features stay free regardless of tier.",
    bestFor:
      "Builders shipping on the edge — Workers apps, global APIs, and AI apps using Workers AI",
    eligibility: [
      "Entry tier open to early-stage startups with no minimum funding",
      "Higher tiers scale with company stage and funding",
      "Credits valid for one year or until consumed",
    ],
    applyUrl: "https://www.cloudflare.com/startups/",
    applyNotes: "Application review typically takes about 48 hours.",
    verified: "2026-07-11",
  },
  {
    slug: "nvidia-inception",
    name: "NVIDIA Inception",
    provider: "NVIDIA",
    category: "GPU & Compute",
    offer: "GPU cloud credits, preferred hardware pricing, and VC intros — free to join",
    description:
      "NVIDIA's startup program: no fees, no equity, no cohorts, no deadlines. Members can access DGX Cloud credits, up to $100,000 in AWS credits through the AWS partnership, preferred GPU pricing, free Deep Learning Institute training, and the Capital Connect VC network.",
    bestFor:
      "AI startups that need serious GPU compute for training or inference",
    eligibility: [
      "Incorporated company less than 10 years old",
      "Working website and at least one developer",
      "Revenue not required",
    ],
    applyUrl: "https://www.nvidia.com/en-us/startups/",
    applyNotes:
      "Rolling applications; initial response typically within 2–4 weeks.",
    verified: "2026-07-11",
  },
  {
    slug: "github-student-pack",
    name: "GitHub Student Developer Pack",
    provider: "GitHub Education",
    category: "Students & Education",
    offer: "GitHub Pro + Copilot Student plan + $300+ in partner cloud credits",
    description:
      "The best deal in tech for anyone with a school email: GitHub Pro, the Copilot Student plan, $100 in Azure credits, $200 in DigitalOcean credits, free domains, JetBrains IDEs, and dozens of other partner offers — free while you're a verified student.",
    bestFor: "Students (13+) at any accredited school, bootcamp, or university",
    eligibility: [
      "Verifiable enrollment at an accredited institution",
      "School-issued email or dated proof of enrollment",
      "Note: new Copilot offer sign-ups were temporarily paused as of mid-2026 — existing verifications keep their plan",
    ],
    applyUrl: "https://education.github.com/pack",
    applyNotes:
      "Verify through GitHub Education; re-verification required periodically while enrolled.",
    verified: "2026-07-11",
  },
  {
    slug: "hf-community-grants",
    name: "Hugging Face Community GPU Grants",
    provider: "Hugging Face",
    category: "Community & Open Source",
    offer: "Free GPU hardware (incl. ZeroGPU) for public Spaces",
    description:
      "If you build a cool, useful demo as a Hugging Face Space, you can apply for a community grant to cover the GPU hardware it runs on. Grants are awarded for innovative, impactful public projects — a favorite route for open-source builders and researchers to run real demos for free.",
    bestFor:
      "Open-source builders and researchers hosting public AI demos on Spaces",
    eligibility: [
      "Public Space on the Hugging Face Hub",
      "Judged on how innovative/useful the project is — no company required",
      "Organizations can also receive ZeroGPU grants for exciting projects",
    ],
    applyUrl: "https://huggingface.co/docs/hub/spaces-gpus",
    applyNotes:
      "Apply directly from your Space: Settings → 'Apply for community GPU grant'.",
    verified: "2026-07-11",
  },
];

export const programCategories: ProgramCategory[] = [
  "Cloud Credits",
  "AI & Model Credits",
  "GPU & Compute",
  "Students & Education",
  "Community & Open Source",
];

export function getProgramsByCategory(category: ProgramCategory): Program[] {
  return programs.filter((p) => p.category === category);
}
