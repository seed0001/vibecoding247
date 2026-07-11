"use client";

import { useEffect } from "react";
import { markLessonVisited } from "@/lib/first-steps-progress";

export function FirstStepsVisitMarker({ slug }: { slug: string }) {
  useEffect(() => {
    markLessonVisited(slug);
  }, [slug]);
  return null;
}
