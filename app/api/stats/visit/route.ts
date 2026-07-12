import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/server/stats-store";
import { worlds } from "@/lib/data/worlds";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let sessionId = "";
  try {
    const body = await req.json();
    if (typeof body.id === "string") sessionId = body.id.slice(0, 64);
  } catch {
    /* fall through to validation below */
  }
  if (!sessionId) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  return NextResponse.json({
    ...recordVisit(sessionId),
    realmsCurrent: worlds.length,
    realmsCapacity: "infinite",
  });
}
