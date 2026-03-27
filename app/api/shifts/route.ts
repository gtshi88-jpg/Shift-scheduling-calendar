import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ShiftAssignmentMap, StaffMember } from "@/app/types";
import { getSessionCookieName, parseSessionToken } from "@/lib/auth";
import { readShiftStore, writeShiftStore } from "@/lib/shift-store";

const MEMBER_EDITABLE_CODES = new Set(["PAID_LEAVE", "REQUEST_OFF"]);

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return parseSessionToken(token);
}

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const store = await readShiftStore();
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ message: "failed to load shifts" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getUserFromCookie();
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
    if (user.role === "member") {
      const current = await readShiftStore();
      const currentStaffFingerprint = JSON.stringify(
        current.staff.map((member) => ({
          id: member.id,
          name: member.name,
          activeFrom: member.activeFrom ?? null,
          activeTo: member.activeTo ?? null,
        })),
      );
      const nextStaffFingerprint = JSON.stringify(
        body.staff.map((member) => ({
          id: member.id,
          name: member.name,
          activeFrom: member.activeFrom ?? null,
          activeTo: member.activeTo ?? null,
        })),
      );
      if (currentStaffFingerprint !== nextStaffFingerprint) {
        return NextResponse.json({ message: "staff update forbidden for member" }, { status: 403 });
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to save shifts" }, { status: 500 });
  }
}
