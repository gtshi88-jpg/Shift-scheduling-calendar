import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieName,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  const user = verifyCredentials(username, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, message: "ユーザー名またはパスワードが違います" },
      { status: 401 },
    );
  }

  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, user });
}
