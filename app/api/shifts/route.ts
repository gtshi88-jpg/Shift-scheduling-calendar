import { NextResponse } from "next/server";
import type { ShiftAssignmentMap, StaffMember } from "@/app/types";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  appendAuditLog,
  memberTouchesConfirmedMonth,
  readAuditLog,
  readConfirmedMonths,
  staffFingerprint,
  summarizeAssignmentDiff,
} from "@/lib/schedule-meta";
import { readShiftStore, writeShiftStore } from "@/lib/shift-store";

const MEMBER_EDITABLE_CODES = new Set(["PAID_LEAVE", "REQUEST_OFF"]);

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const store = await readShiftStore();
    const [confirmedMonths, auditLog] = await Promise.all([readConfirmedMonths(), readAuditLog(80)]);
    return NextResponse.json({
      ...store,
      confirmedMonths,
      auditLog,
    });
  } catch {
    return NextResponse.json({ message: "failed to load shifts" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    staff?: StaffMember[];
    assignments?: ShiftAssignmentMap;
    __debugLastEdit?: null | { dateKey: string; staffId: string; attemptedCode: string };
    __debugRunId?: string;
  };
  if (!Array.isArray(body.staff) || !body.assignments) {
    return NextResponse.json({ message: "invalid payload" }, { status: 400 });
  }
  const debugLastEdit = body.__debugLastEdit ?? null;
  const debugRunId = body.__debugRunId ?? "server";

  try {
    const current = await readShiftStore();
    const confirmedRows = await readConfirmedMonths();
    const confirmedYearMonths = new Set(confirmedRows.map((row) => row.yearMonth));

    if (user.role === "member") {
      if (staffFingerprint(current.staff) !== staffFingerprint(body.staff)) {
        // #region agent log
        void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId: debugRunId,
            hypothesisId: "H2_putRequestPayload",
            location: "app/api/shifts/route.ts:PUT",
            message: "member rejected: staff fingerprint mismatch",
            data: { debugLastEdit },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return NextResponse.json({ message: "staff update forbidden for member" }, { status: 403 });
      }

      if (
        memberTouchesConfirmedMonth({
          prev: current.assignments,
          next: body.assignments,
          confirmedYearMonths,
        })
      ) {
        // #region agent log
        void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId: debugRunId,
            hypothesisId: "H3_apiResponse",
            location: "app/api/shifts/route.ts:PUT",
            message: "member rejected: touching confirmed month",
            data: { debugLastEdit },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return NextResponse.json(
          { message: "confirmed month cannot be edited by member" },
          { status: 403 },
        );
      }

      const allDateKeys = new Set([
        ...Object.keys(current.assignments),
        ...Object.keys(body.assignments),
      ]);
      for (const dateKey of allDateKeys) {
        const prevByStaff = current.assignments[dateKey] ?? {};
        const nextByStaff = body.assignments[dateKey] ?? {};
        const allStaffIds = new Set([
          ...Object.keys(prevByStaff),
          ...Object.keys(nextByStaff),
        ]);
        for (const staffId of allStaffIds) {
          const prevCode = prevByStaff[staffId] ?? "REGULAR_OFF";
          const nextCode = nextByStaff[staffId] ?? "REGULAR_OFF";
          if (prevCode === nextCode) {
            continue;
          }
          const cancelToRegularOffAllowed =
            nextCode === "REGULAR_OFF" && MEMBER_EDITABLE_CODES.has(prevCode);
          if (!MEMBER_EDITABLE_CODES.has(nextCode) && !cancelToRegularOffAllowed) {
            // #region agent log
            void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                runId: debugRunId,
                hypothesisId: "H3_apiResponse",
                location: "app/api/shifts/route.ts:PUT",
                message: "member rejected: edit forbidden shift code",
                data: { debugLastEdit, dateKey, staffId, prevCode, nextCode },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
            return NextResponse.json(
              { message: "members can edit only REQUEST_OFF or PAID_LEAVE" },
              { status: 403 },
            );
          }
        }
      }
    }

    // #region agent log
    if (debugLastEdit) {
      const payloadCode = body.assignments?.[debugLastEdit.dateKey]?.[debugLastEdit.staffId] ?? null;
      void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: debugRunId,
          hypothesisId: "H6_payloadHasCellAtWriteTime",
          location: "app/api/shifts/route.ts:PUT",
          message: "check payload cell existence before writeShiftStore",
          data: { debugLastEdit, payloadCode },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    await writeShiftStore({
      staff: body.staff,
      assignments: body.assignments,
    });

    // #region agent log
    if (debugLastEdit) {
      // まずはDBを直接叩いて行が存在するか確認（readShiftStore のフォールバック等を切り分け）
      const supabase = createSupabaseServerClient();
      const { data: rows, error } = await supabase
        .from("shift_assignments")
        .select("shift_code")
        .eq("work_date", debugLastEdit.dateKey)
        .eq("staff_id", debugLastEdit.staffId);
      const directAfterCode = Array.isArray(rows) && rows.length > 0 ? (rows[0].shift_code as string) : null;
      void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: debugRunId,
          hypothesisId: "H7_directDbCellExistenceAfterWrite",
          location: "app/api/shifts/route.ts:PUT",
          message: "direct DB cell existence after writeShiftStore for last edit",
          data: { debugLastEdit, directAfterCode, dbError: error ? String(error.message ?? error) : null },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    const diff = summarizeAssignmentDiff(current.assignments, body.assignments);
    const staffChanged = staffFingerprint(current.staff) !== staffFingerprint(body.staff);
    try {
      await appendAuditLog(user.username, "save", {
        changedCells: diff.changedCells,
        staffChanged,
        monthsTouched: diff.monthsTouched,
      });
    } catch {
      // 保存は完了済み。履歴テーブル未作成時などは続行する。
    }

    // #region agent log
    void fetch("http://127.0.0.1:7251/ingest/a9594a31-b722-4292-a28c-3a9e7b290058", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: debugRunId,
        hypothesisId: "H3_apiResponse",
        location: "app/api/shifts/route.ts:PUT",
        message: "member/admin save ok",
        data: { debugLastEdit, changedCells: diff.changedCells, monthsTouched: diff.monthsTouched },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to save shifts" }, { status: 500 });
  }
}
