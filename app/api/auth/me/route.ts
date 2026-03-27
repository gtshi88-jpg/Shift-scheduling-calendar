import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, parseSessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const user = parseSessionToken(token);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
