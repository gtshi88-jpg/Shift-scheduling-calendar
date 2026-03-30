// このファイルはシフト管理のデータを読み書きするためのファイルです
// このファイルはSupabaseのサーバーサイドクライアントを使用してデータを読み書きします
// このファイルはシフト管理のデータを読み書きするためのファイルです

import type { ShiftAssignmentMap, ShiftCode, StaffJobTypeRecord, StaffMember } from "@/app/types";
import { defaultStaffJobTypesSeed, FALLBACK_STAFF_JOB_TYPE_ID, normalizeStaffJobTypeId } from "@/app/types";
import { createInitialData } from "@/app/utils/schedule";
import { readStaffJobTypes } from "@/lib/staff-job-types-store";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ShiftStore = {
  staff: StaffMember[];
  assignments: ShiftAssignmentMap;
  jobTypes: StaffJobTypeRecord[];
};

type StaffRow = {
  id: string;
  name: string;
  sort_order: number;
  active_from: string | null;
  active_to: string | null;
  job_type_id: string | null;
};

type ShiftRow = {
  work_date: string;
  staff_id: string;
  shift_code: string;
};

export async function readShiftStore(): Promise<ShiftStore> {
  const supabase = createSupabaseServerClient();

  try {
    const [jobTypes, staffResult] = await Promise.all([
      readStaffJobTypes(),
      supabase
        .from("staff_members")
        .select("id,name,sort_order,active_from,active_to,job_type_id")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    const { data: staffRows, error: staffError } = staffResult;
    if (staffError) {
      throw staffError;
    }

    const staff: StaffMember[] = (staffRows as StaffRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      jobTypeId: normalizeStaffJobTypeId(row.job_type_id, FALLBACK_STAFF_JOB_TYPE_ID),
      activeFrom: row.active_from,
      activeTo: row.active_to,
    }));

    // #region agent log
    const debugRunId = `readShiftStore_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`;
    try {
      const { count: totalCount, error: countError } = await supabase
        .from("shift_assignments")
        .select("work_date", { count: "exact", head: true });
      if (!countError) {
        void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId: debugRunId,
            hypothesisId: "H9_shiftAssignmentsCountVsReturned",
            location: "lib/shift-store.ts:readShiftStore",
            message: "shift_assignments total count",
            data: { totalCount },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
    } catch {
      // ignore count errors
    }
    // #endregion

    // Supabase/PostgREST のデフォルト上限（多くの場合 1000 rows）により
    // shift_assignments が途中で切り詰められることがあるため、ページングで全件取得する
    const pageSize = 1000;
    let offset = 0;
    const allShiftRows: ShiftRow[] = [];
    while (true) {
      // inclusive range: [from, to]
      const { data, error: pageError } = await supabase
        .from("shift_assignments")
        .select("work_date,staff_id,shift_code")
        .order("work_date", { ascending: true })
        .order("staff_id", { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (pageError) {
        throw pageError;
      }
      const pageRows = (data ?? []) as ShiftRow[];
      allShiftRows.push(...pageRows);
      if (pageRows.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    const shiftRows = allShiftRows;
    // #region agent log
    try {
      const returnedCount = Array.isArray(shiftRows) ? shiftRows.length : 0;
      void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: debugRunId,
          hypothesisId: "H9_shiftAssignmentsCountVsReturned",
          location: "lib/shift-store.ts:readShiftStore",
          message: "shift_assignments returned rows count",
          data: { returnedCount },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch {
      // ignore log failures
    }
    // #endregion

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
        jobTypes: jobTypes.length > 0 ? jobTypes : defaultStaffJobTypesSeed(),
      };
    }

    return { staff, assignments, jobTypes: jobTypes.length > 0 ? jobTypes : defaultStaffJobTypesSeed() };
  } catch {
    const initial = createInitialData(new Date(2026, 2, 1));
    return {
      staff: initial.staff,
      assignments: initial.assignments,
      jobTypes: defaultStaffJobTypesSeed(),
    };
  }
}

export async function writeShiftStore(value: Omit<ShiftStore, "jobTypes">): Promise<void> {
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
    job_type_id: member.jobTypeId,
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
