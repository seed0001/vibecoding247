import { NextResponse } from "next/server";
import { getStats } from "@/lib/server/stats-store";
import { countApps, worlds } from "@/lib/data/worlds";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ...getStats(),
    realmsCurrent: worlds.length,
    realmsCapacity: "infinite",
    gamesCurrent: countApps(),
    gamesCapacity: "infinite",
  });
}
