import { NextResponse } from "next/server";
import { recordHeartbeat } from "@/lib/server/stats-store";
import { countApps, worlds } from "@/lib/data/worlds";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let sessionId = "";
  let seconds = 0;
  try {
    // sendBeacon delivers text/plain; fetch sends application/json — parse either
    const body = JSON.parse(await req.text());
    if (typeof body.id === "string") sessionId = body.id.slice(0, 64);
    if (typeof body.seconds === "number") seconds = body.seconds;
  } catch {
    /* fall through to validation below */
  }
  if (!sessionId) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  return NextResponse.json({
    ...recordHeartbeat(sessionId, seconds),
    realmsCurrent: worlds.length,
    realmsCapacity: "infinite",
    gamesCurrent: countApps(),
    gamesCapacity: "infinite",
  });
}
