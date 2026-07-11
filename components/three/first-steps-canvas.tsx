"use client";

import dynamic from "next/dynamic";
import type { WorldLesson } from "./first-steps-world";

const FirstStepsWorld = dynamic(
  () => import("./first-steps-world").then((m) => m.FirstStepsWorld),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-sky-200 text-sm font-bold text-sky-800">
        Building your islands…
      </div>
    ),
  },
);

export function FirstStepsCanvas({ lessons }: { lessons: WorldLesson[] }) {
  return <FirstStepsWorld lessons={lessons} />;
}
