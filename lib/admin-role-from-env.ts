import type { UserRole } from "@/app/types";

/** カンマ区切り。DB のルールに加え、マイグレーション前やローカル検証用 */
export function roleFromEnvAdminRules(email: string | undefined): UserRole | null {
  if (!email?.trim()) {
    return null;
  }
  const lower = email.trim().toLowerCase();
  const exactList =
    process.env.ADMIN_EMAILS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (exactList.includes(lower)) {
    return "admin";
  }
  const domainPart = lower.split("@")[1];
  if (!domainPart) {
    return null;
  }
  const domains =
    process.env.ADMIN_EMAIL_DOMAINS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (domains.includes(domainPart)) {
    return "admin";
  }
  return null;
}

export function mergeRole(base: UserRole, envHint: UserRole | null): UserRole {
  if (base === "admin" || envHint === "admin") {
    return "admin";
  }
  return "member";
}
