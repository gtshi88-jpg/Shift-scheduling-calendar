import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createSupabaseAuthServerClient(cookieStore);
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
