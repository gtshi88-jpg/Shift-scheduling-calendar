// このファイルはSupabaseのサーバーサイドクライアントを作成するためのファイルです
// Supabaseはデータベースを管理するためのツールです
// このファイルはSupabaseのサーバーサイドクライアントを作成するためのファイルです

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseAuthCredentials } from "@/lib/supabase/env";

type NextCookieStore = Awaited<ReturnType<typeof cookies>>;

/** Route Handler / Server Component 用: Cookie 経由で Supabase Auth セッションを扱う */
export function createSupabaseAuthServerClient(cookieStore: NextCookieStore) {
  const creds = getSupabaseAuthCredentials();
  if (!creds) {
    throw new Error(
      "Supabase の接続情報が不足しています。NEXT_PUBLIC_SUPABASE_URL（または SUPABASE_URL）と NEXT_PUBLIC_SUPABASE_ANON_KEY（または SUPABASE_ANON_KEY）を .env.local に設定してください。",
    );
  }
  return createServerClient(creds.url, creds.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component など set できないコンテキスト
        }
      },
    },
  });
}
