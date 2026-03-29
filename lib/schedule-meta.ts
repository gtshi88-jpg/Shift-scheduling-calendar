import type { ShiftAssignmentMap, StaffMember } from "@/app/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type ConfirmedMonthRow = {
  yearMonth: string;
  confirmedAt: string;
  confirmedBy: string;
};

export type AuditLogRow = {
  id: string;
  createdAt: string;
  actorUsername: string;
  action: string;
  detail: Record<string, unknown>;
};

export async function readConfirmedMonths(): Promise<ConfirmedMonthRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("confirmed_months")
      .select("year_month,confirmed_at,confirmed_by")
      .order("year_month", { ascending: true });
    if (error) {
      throw error;
    }
    return (data ?? []).map((row) => ({
      yearMonth: row.year_month as string,
      confirmedAt: row.confirmed_at as string,
      confirmedBy: row.confirmed_by as string,
    }));
  } catch {
    return [];
  }
}

export async function setMonthConfirmed(yearMonth: string, confirmedBy: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("confirmed_months").upsert(
    {
      year_month: yearMonth,
      confirmed_by: confirmedBy,
      confirmed_at: new Date().toISOString(),
    },
    { onConflict: "year_month" },
  );
  if (error) {
    throw error;
  }
}

export async function setMonthUnconfirmed(yearMonth: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("confirmed_months").delete().eq("year_month", yearMonth);
  if (error) {
    throw error;
  }
}

export async function appendAuditLog(
  actorUsername: string,
  action: string,
  detail: Record<string, unknown>,
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("shift_audit_log").insert({
    actor_username: actorUsername,
    action,
    detail,
  });
  if (error) {
    throw error;
  }
}

export async function readAuditLog(limit: number): Promise<AuditLogRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("shift_audit_log")
      .select("id,created_at,actor_username,action,detail")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      throw error;
    }
    return (data ?? []).map((row) => ({
      id: row.id as string,
      createdAt: row.created_at as string,
      actorUsername: row.actor_username as string,
      action: row.action as string,
      detail: (row.detail ?? {}) as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}

export function yearMonthFromDateKey(dateKey: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }
  return dateKey.slice(0, 7);
}

function assignmentCellMap(assignments: ShiftAssignmentMap): Map<string, string> {
  const map = new Map<string, string>();
  for (const [dateKey, byStaff] of Object.entries(assignments ?? {})) {
    for (const [staffId, code] of Object.entries(byStaff ?? {})) {
      map.set(`${dateKey}|${staffId}`, code);
    }
  }
  return map;
}

export function summarizeAssignmentDiff(prev: ShiftAssignmentMap, next: ShiftAssignmentMap) {
  const prevM = assignmentCellMap(prev);
  const nextM = assignmentCellMap(next);
  const allKeys = new Set([...prevM.keys(), ...nextM.keys()]);
  let changedCells = 0;
  const monthsTouched = new Set<string>();
  for (const key of allKeys) {
    if (prevM.get(key) === nextM.get(key)) {
      continue;
    }
    changedCells += 1;
    const dateKey = key.split("|")[0] ?? "";
    const ym = yearMonthFromDateKey(dateKey);
    if (ym) {
      monthsTouched.add(ym);
    }
  }
  return { changedCells, monthsTouched: [...monthsTouched].sort() };
}

export function memberTouchesConfirmedMonth(args: {
  prev: ShiftAssignmentMap;
  next: ShiftAssignmentMap;
  confirmedYearMonths: Set<string>;
}): boolean {
  const prevM = assignmentCellMap(args.prev);
  const nextM = assignmentCellMap(args.next);
  const allKeys = new Set([...prevM.keys(), ...nextM.keys()]);
  for (const key of allKeys) {
    if (prevM.get(key) === nextM.get(key)) {
      continue;
    }
    const dateKey = key.split("|")[0] ?? "";
    const ym = yearMonthFromDateKey(dateKey);
    if (ym && args.confirmedYearMonths.has(ym)) {
      return true;
    }
  }
  return false;
}

export function staffFingerprint(staff: StaffMember[]): string {
  return JSON.stringify(
    staff.map((member) => ({
      id: member.id,
      name: member.name,
      jobTypeId: member.jobTypeId,
      activeFrom: member.activeFrom ?? null,
      activeTo: member.activeTo ?? null,
    })),
  );
}
