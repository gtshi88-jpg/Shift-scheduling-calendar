import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { appendAuditLog, setMonthConfirmed, setMonthUnconfirmed } from "@/lib/schedule-meta";

function isYearMonth(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value);
}

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const body = (await req.json()) as { yearMonth?: string };
  if (!isYearMonth(body.yearMonth)) {
    return NextResponse.json({ message: "invalid yearMonth" }, { status: 400 });
  }
  try {
    await setMonthConfirmed(body.yearMonth, user.username);
    try {
      await appendAuditLog(user.username, "confirm_month", { yearMonth: body.yearMonth });
    } catch {
      // ignore audit failure
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to confirm month" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const yearMonth = url.searchParams.get("yearMonth");
  if (!isYearMonth(yearMonth)) {
    return NextResponse.json({ message: "invalid yearMonth" }, { status: 400 });
  }
  try {
    await setMonthUnconfirmed(yearMonth);
    try {
      await appendAuditLog(user.username, "unconfirm_month", { yearMonth });
    } catch {
      // ignore audit failure
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to unconfirm month" }, { status: 500 });
  }
}
