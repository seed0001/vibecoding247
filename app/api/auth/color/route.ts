import { NextResponse } from "next/server";
import { readTokenFromCookie, setColor } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = readTokenFromCookie(req.headers.get("cookie"));
  let color = "";
  try {
    const body = await req.json();
    color = String(body.color ?? "");
  } catch {
    /* validated below */
  }
  const user = setColor(token, color);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ user });
}
