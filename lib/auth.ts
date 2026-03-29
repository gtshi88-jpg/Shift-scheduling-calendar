import { cookies } from "next/headers";
import type { AuthUser, UserRole } from "@/app/types";
import { mergeRole, roleFromEnvAdminRules } from "@/lib/admin-role-from-env";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const supabase = createSupabaseAuthServerClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  const email = user.email ?? "";

  const { data: rpcRole, error: rpcError } = await supabase.rpc("effective_auth_role");
  if (!rpcError && (rpcRole === "admin" || rpcRole === "member")) {
    const envRole = roleFromEnvAdminRules(email);
    const role: UserRole = mergeRole(rpcRole, envRole);
    return {
      username: email || user.id,
      role,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    const envRole = roleFromEnvAdminRules(email);
    return {
      username: email || user.id,
      role: envRole ?? "member",
    };
  }
  const base: UserRole = profile?.role === "admin" ? "admin" : "member";
  const envRole = roleFromEnvAdminRules(email);
  const role = mergeRole(base, envRole);
  return {
    username: email || user.id,
    role,
  };
}
