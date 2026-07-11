import type { MetadataRoute } from "next";
import { guides } from "@/lib/data/guides";

const BASE = "https://vibecoding247.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/guides", "/pulse", "/programs", "/about"].map(
    (path) => ({
      url: `${BASE}${path}`,
    }),
  );

  const guidePages = guides.map((guide) => ({
    url: `${BASE}/guides/${guide.slug}`,
  }));

  return [...staticPages, ...guidePages];
}
