/** URL・anon キー（サーバーは SUPABASE_* でも可。クライアントは next.config の env 注入後に NEXT_PUBLIC が埋まる） */
export function getSupabaseAuthCredentials(): { url: string; anonKey: string } | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    "";
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}
