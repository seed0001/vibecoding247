import type {
  CommunitySpot,
  ModelHighlight,
  RepoHighlight,
  TrendSignal,
} from "@/lib/types";

/**
 * Editorial trend radar — curated by hand, refreshed with each content pass.
 * The live GitHub / Hugging Face sections on the Pulse page complement this
 * with data fetched at request time.
 */
export const trendSignals: TrendSignal[] = [
  {
    title: "Agentic coding goes autonomous",
    momentum: "Hot",
    description:
      "The center of gravity has moved from autocomplete to agents that take a task, work across the whole repo, run the tests, and open a pull request. Cloud agents that work while you sleep — and fleets of parallel agents on one codebase — are the current frontier.",
    tags: ["agents", "claude-code", "cloud-agents"],
  },
  {
    title: "MCP is becoming the USB port of AI apps",
    momentum: "Hot",
    description:
      "The Model Context Protocol keeps eating the integration layer: one standard for wiring models to databases, browsers, SaaS tools, and each other. New servers appear daily, and 'does it speak MCP?' is now a default question for dev tools.",
    tags: ["mcp", "integrations", "tooling"],
  },
  {
    title: "Spec-driven development",
    momentum: "Rising",
    description:
      "Write the spec, let agents implement against it. Teams are treating markdown specs, AGENTS.md files, and plan-first workflows as the real source code — with the implementation increasingly disposable and regenerable.",
    tags: ["workflow", "specs", "best-practices"],
  },
  {
    title: "Small + open models get startlingly good",
    momentum: "Rising",
    description:
      "Open-weight models keep closing the gap for well-defined tasks, and on-device inference is going mainstream. High-volume features that once demanded frontier APIs now run on models you can download from Hugging Face.",
    tags: ["open-models", "hugging-face", "local-ai"],
  },
  {
    title: "Security scrutiny of vibe-coded apps",
    momentum: "Rising",
    description:
      "With a wave of AI-built apps in production, researchers and attackers alike are scanning for the classic misses: exposed keys, missing row-level security, client-only auth checks. Security review prompts and automated scanners are becoming a standard part of the ship checklist.",
    tags: ["security", "best-practices"],
  },
  {
    title: "From vibe coding to vibe engineering",
    momentum: "Steady",
    description:
      "The community discourse matured: pure vibes get you a demo, but shipping means version control, tests, review, and deliberate architecture — with AI doing the labor at every step. The winning skill set is direction and judgment, not syntax.",
    tags: ["culture", "workflow"],
  },
];

export const communitySpots: CommunitySpot[] = [
  {
    name: "r/vibecoding",
    platform: "Reddit",
    description:
      "Show-and-tell builds, tool debates, and honest postmortems from people shipping with AI every day.",
    url: "https://www.reddit.com/r/vibecoding/",
  },
  {
    name: "GitHub Trending",
    platform: "GitHub",
    description:
      "The daily pulse of what developers are starring — new agent frameworks and AI dev tools regularly top the charts.",
    url: "https://github.com/trending",
  },
  {
    name: "Hugging Face Spaces",
    platform: "Hugging Face",
    description:
      "Live demos of new models and AI apps. The fastest way to see what's newly possible, usually before the blog posts land.",
    url: "https://huggingface.co/spaces",
  },
  {
    name: "Claude Developers Discord",
    platform: "Discord",
    description:
      "Builders comparing agent workflows, MCP servers, and prompting techniques for Claude and Claude Code.",
    url: "https://www.anthropic.com/discord",
  },
  {
    name: "Cursor Community Forum",
    platform: "Forum",
    description:
      "Deep threads on AI-editor workflows, rules files, and getting the most out of agent mode.",
    url: "https://forum.cursor.com/",
  },
  {
    name: "Product Hunt",
    platform: "Product Hunt",
    description:
      "Where vibe-coded products launch. Great for spotting what solo builders are shipping — and what's resonating.",
    url: "https://www.producthunt.com/",
  },
];

/**
 * Fallbacks shown if the live GitHub / Hugging Face fetches fail
 * (rate limits, network hiccups). Reasonable evergreen picks.
 */
export const fallbackRepos: RepoHighlight[] = [
  {
    fullName: "anthropics/claude-code",
    url: "https://github.com/anthropics/claude-code",
    description: "Anthropic's agentic coding tool that lives in your terminal.",
    stars: 60000,
    language: "TypeScript",
  },
  {
    fullName: "modelcontextprotocol/servers",
    url: "https://github.com/modelcontextprotocol/servers",
    description: "Reference servers for the Model Context Protocol.",
    stars: 70000,
    language: "TypeScript",
  },
  {
    fullName: "huggingface/transformers",
    url: "https://github.com/huggingface/transformers",
    description:
      "State-of-the-art machine learning for text, vision, and audio.",
    stars: 155000,
    language: "Python",
  },
  {
    fullName: "vercel/next.js",
    url: "https://github.com/vercel/next.js",
    description: "The React framework for the web.",
    stars: 135000,
    language: "JavaScript",
  },
  {
    fullName: "langchain-ai/langchain",
    url: "https://github.com/langchain-ai/langchain",
    description: "Build context-aware reasoning applications.",
    stars: 120000,
    language: "Python",
  },
  {
    fullName: "ollama/ollama",
    url: "https://github.com/ollama/ollama",
    description: "Get up and running with large language models locally.",
    stars: 155000,
    language: "Go",
  },
];

export const fallbackModels: ModelHighlight[] = [
  {
    id: "openai/whisper-large-v3",
    url: "https://huggingface.co/openai/whisper-large-v3",
    likes: 5000,
    downloads: 4000000,
    pipeline: "automatic-speech-recognition",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    url: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
    likes: 2500,
    downloads: 1500000,
    pipeline: "text-generation",
  },
  {
    id: "Qwen/Qwen3-235B-A22B",
    url: "https://huggingface.co/Qwen/Qwen3-235B-A22B",
    likes: 2000,
    downloads: 800000,
    pipeline: "text-generation",
  },
  {
    id: "black-forest-labs/FLUX.1-dev",
    url: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
    likes: 10000,
    downloads: 2000000,
    pipeline: "text-to-image",
  },
  {
    id: "deepseek-ai/DeepSeek-R1",
    url: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
    likes: 12000,
    downloads: 1200000,
    pipeline: "text-generation",
  },
  {
    id: "sentence-transformers/all-MiniLM-L6-v2",
    url: "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
    likes: 3500,
    downloads: 80000000,
    pipeline: "sentence-similarity",
  },
];
