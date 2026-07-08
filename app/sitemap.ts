import type { MetadataRoute } from "next";
import { courses } from "@/lib/data/courses";

const BASE = "https://vibecoding247.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/courses", "/schedule", "/about"].map((path) => ({
    url: `${BASE}${path}`,
  }));

  const coursePages = courses.map((course) => ({
    url: `${BASE}/courses/${course.slug}`,
  }));

  const lessonPages = courses.flatMap((course) =>
    course.modules.flatMap((mod) =>
      mod.lessons.map((lesson) => ({
        url: `${BASE}/courses/${course.slug}/lessons/${lesson.slug}`,
      })),
    ),
  );

  return [...staticPages, ...coursePages, ...lessonPages];
}
