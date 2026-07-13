import { NextResponse } from "next/server";
import { SESSION_COOKIE, signup } from "@/lib/server/auth-store";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`signup:${clientIp(req)}`, 5, 600_000)) {
    return NextResponse.json(
      { error: "Too many sign-ups from here — try again later." },
      { status: 429 },
    );
  }
  let handle = "";
  let password = "";
  let color = "";
  try {
    const body = await req.json();
    handle = String(body.handle ?? "").trim();
    password = String(body.password ?? "");
    color = String(body.color ?? "");
  } catch {
    /* validated below */
  }
  const result = await signup(handle, password, color);
  if (result.error || !result.user || !result.token) {
    return NextResponse.json(
      { error: result.error ?? "Sign-up failed." },
      { status: 400 },
    );
  }
  const res = NextResponse.json({ user: result.user });
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 3600,
    path: "/",
  });
  return res;
}
