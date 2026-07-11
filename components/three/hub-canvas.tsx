"use client";

import dynamic from "next/dynamic";

const HubScene = dynamic(
  () => import("./hub-scene").then((m) => m.HubScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-subtle">
        Warming up the portals…
      </div>
    ),
  },
);

export function HubCanvas() {
  return <HubScene />;
}
