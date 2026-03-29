import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAuthCredentials } from "@/lib/supabase/env";

/** ブラウザ用（next.config の env で SUPABASE_* からも注入可） */
export function createSupabaseBrowserClient() {
  const creds = getSupabaseAuthCredentials();
  if (!creds) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY（または SUPABASE_URL と SUPABASE_ANON_KEY）を .env.local に設定し、開発サーバーを再起動してください。",
    );
  }
  return createBrowserClient(creds.url, creds.anonKey);
}
