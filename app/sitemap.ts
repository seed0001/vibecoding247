import type { MetadataRoute } from "next";
import { guides } from "@/lib/data/guides";
import { firstStepsLessons } from "@/lib/data/first-steps";

const BASE = "https://vibecoding247.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/guides",
    "/pulse",
    "/programs",
    "/about",
    "/first-steps",
    "/new-to-ai",
  ].map((path) => ({
    url: `${BASE}${path}`,
  }));

  const guidePages = guides.map((guide) => ({
    url: `${BASE}/guides/${guide.slug}`,
  }));

  const lessonPages = firstStepsLessons.map((lesson) => ({
    url: `${BASE}/first-steps/${lesson.slug}`,
  }));

  return [...staticPages, ...guidePages, ...lessonPages];
}
