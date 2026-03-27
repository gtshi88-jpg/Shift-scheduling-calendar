import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
  return NextResponse.json({ ok: true });
}
