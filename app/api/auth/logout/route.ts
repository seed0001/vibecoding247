import { NextResponse } from "next/server";
import {
  logout,
  readTokenFromCookie,
  SESSION_COOKIE,
} from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = readTokenFromCookie(req.headers.get("cookie"));
  if (token) logout(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
