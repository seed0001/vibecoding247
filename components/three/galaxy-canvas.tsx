"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary } from "@/components/three/canvas-boundary";

const GalaxyExperience = dynamic(
  () => import("./galaxy-experience").then((m) => m.GalaxyExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-white/50">
        Powering up the hangar…
      </div>
    ),
  },
);

export function GalaxyCanvas() {
  return (
    <CanvasBoundary>
      <GalaxyExperience />
    </CanvasBoundary>
  );
}
