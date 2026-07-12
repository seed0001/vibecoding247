"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary } from "@/components/three/canvas-boundary";
import type { WorldLesson } from "./first-steps-playground";

const FirstStepsPlayground = dynamic(
  () => import("./first-steps-playground").then((m) => m.FirstStepsPlayground),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-sky-200 text-sm font-bold text-sky-800">
        Building your playground…
      </div>
    ),
  },
);

export function FirstStepsCanvas({ lessons }: { lessons: WorldLesson[] }) {
  return (
    <CanvasBoundary>
      <FirstStepsPlayground lessons={lessons} />
    </CanvasBoundary>
  );
}
