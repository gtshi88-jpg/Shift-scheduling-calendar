import { NextResponse } from "next/server";
import type { ShiftAssignmentMap, StaffMember } from "@/app/types";
import { getAuthUser } from "@/lib/auth";
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
  };
  if (!Array.isArray(body.staff) || !body.assignments) {
    return NextResponse.json({ message: "invalid payload" }, { status: 400 });
  }

  try {
    const current = await readShiftStore();
    const confirmedRows = await readConfirmedMonths();
    const confirmedYearMonths = new Set(confirmedRows.map((row) => row.yearMonth));

    if (user.role === "member") {
      if (staffFingerprint(current.staff) !== staffFingerprint(body.staff)) {
        return NextResponse.json({ message: "staff update forbidden for member" }, { status: 403 });
      }

      if (
        memberTouchesConfirmedMonth({
          prev: current.assignments,
          next: body.assignments,
          confirmedYearMonths,
        })
      ) {
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
            return NextResponse.json(
              { message: "members can edit only REQUEST_OFF or PAID_LEAVE" },
              { status: 403 },
            );
          }
        }
      }
    }

    await writeShiftStore({
      staff: body.staff,
      assignments: body.assignments,
    });

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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to save shifts" }, { status: 500 });
  }
}
