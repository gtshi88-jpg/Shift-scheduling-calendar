// このファイルはNext.jsのミドルウェアを作成するためのファイルです
// Next.jsはフロントエンドのフレームワークです
// このファイルはNext.jsのミドルウェアを作成するためのファイルです

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseAuthCredentials } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const creds = getSupabaseAuthCredentials();
  if (!creds) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(creds.url, creds.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
