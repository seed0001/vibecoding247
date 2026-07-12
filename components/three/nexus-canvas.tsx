"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary } from "@/components/three/canvas-boundary";
import type { World } from "@/lib/data/worlds";

const NexusExperience = dynamic(
  () => import("./nexus").then((m) => m.NexusExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-white/50">
        Opening the doors…
      </div>
    ),
  },
);

export function NexusCanvas({ worlds }: { worlds: World[] }) {
  return (
    <CanvasBoundary>
      <NexusExperience worlds={worlds} />
    </CanvasBoundary>
  );
}
