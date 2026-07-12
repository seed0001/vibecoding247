import { NextResponse } from "next/server";
import {
  getUserByToken,
  ORB_COLORS,
  readTokenFromCookie,
} from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const token = readTokenFromCookie(req.headers.get("cookie"));
  const user = getUserByToken(token);
  return NextResponse.json({ user, orbColors: ORB_COLORS });
}
