"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary } from "@/components/three/canvas-boundary";
import type { World } from "@/lib/data/worlds";

const WorldExperience = dynamic(
  () => import("./world-scene").then((m) => m.WorldExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-white/50">
        Traveling…
      </div>
    ),
  },
);

export function WorldCanvas({ world }: { world: World }) {
  return (
    <CanvasBoundary>
      <WorldExperience world={world} />
    </CanvasBoundary>
  );
}
