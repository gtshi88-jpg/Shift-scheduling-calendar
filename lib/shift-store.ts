// このファイルはシフト管理のデータを読み書きするためのファイルです
// このファイルはSupabaseのサーバーサイドクライアントを使用してデータを読み書きします
// このファイルはシフト管理のデータを読み書きするためのファイルです

import type { ShiftAssignmentMap, ShiftCode, StaffMember } from "@/app/types";
import { createInitialData } from "@/app/utils/schedule";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ShiftStore = {
  staff: StaffMember[];
  assignments: ShiftAssignmentMap;
};

type StaffRow = {
  id: string;
  name: string;
  sort_order: number;
  active_from: string | null;
  active_to: string | null;
};

type ShiftRow = {
  work_date: string;
  staff_id: string;
  shift_code: string;
};

export async function readShiftStore(): Promise<ShiftStore> {
  const supabase = createSupabaseServerClient();

  try {
    const { data: staffRows, error: staffError } = await supabase
      .from("staff_members")
      .select("id,name,sort_order,active_from,active_to")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (staffError) {
      throw staffError;
    }

    const staff: StaffMember[] = (staffRows as StaffRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      activeFrom: row.active_from,
      activeTo: row.active_to,
    }));

    const { data: shiftRows, error: shiftsError } = await supabase
      .from("shift_assignments")
      .select("work_date,staff_id,shift_code");
    if (shiftsError) {
      throw shiftsError;
    }

    const assignments: ShiftAssignmentMap = {};
    for (const row of shiftRows as ShiftRow[]) {
      if (!assignments[row.work_date]) {
        assignments[row.work_date] = {};
      }
      assignments[row.work_date][row.staff_id] = row.shift_code as ShiftCode;
    }

    if (staff.length === 0) {
      const initial = createInitialData(new Date(2026, 2, 1));
      return {
        staff: initial.staff,
        assignments: initial.assignments,
      };
    }

    return { staff, assignments };
  } catch {
    const initial = createInitialData(new Date(2026, 2, 1));
    return {
      staff: initial.staff,
      assignments: initial.assignments,
    };
  }
}

export async function writeShiftStore(value: ShiftStore): Promise<void> {
  const supabase = createSupabaseServerClient();
  const staff = value.staff;
  const assignments = value.assignments;

  const existingIds = new Set(staff.map((member) => member.id));

  const { data: currentStaff, error: currentStaffError } = await supabase
    .from("staff_members")
    .select("id");
  if (currentStaffError) {
    throw currentStaffError;
  }

  const removeIds = (currentStaff ?? [])
    .map((item) => item.id as string)
    .filter((id) => !existingIds.has(id));

  if (removeIds.length > 0) {
    const { error: deleteStaffError } = await supabase
      .from("staff_members")
      .delete()
      .in("id", removeIds);
    if (deleteStaffError) {
      throw deleteStaffError;
    }
  }

  const upsertStaffRows = staff.map((member, index) => ({
    id: member.id,
    name: member.name,
    sort_order: index,
    active_from: member.activeFrom ?? null,
    active_to: member.activeTo ?? null,
  }));

  if (upsertStaffRows.length > 0) {
    const { error: upsertStaffError } = await supabase
      .from("staff_members")
      .upsert(upsertStaffRows, { onConflict: "id" });
    if (upsertStaffError) {
      throw upsertStaffError;
    }
  }

  const { error: deleteAssignmentsError } = await supabase
    .from("shift_assignments")
    .delete()
    .neq("work_date", "1900-01-01");
  if (deleteAssignmentsError) {
    throw deleteAssignmentsError;
  }

  const rows: Array<{ work_date: string; staff_id: string; shift_code: string }> = [];
  for (const [workDate, byStaff] of Object.entries(assignments)) {
    for (const [staffId, shiftCode] of Object.entries(byStaff)) {
      rows.push({ work_date: workDate, staff_id: staffId, shift_code: shiftCode });
    }
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("shift_assignments").insert(rows);
    if (insertError) {
      throw insertError;
    }
  }
}
