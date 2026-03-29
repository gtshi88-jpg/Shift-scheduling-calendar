import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  createStaffJobType,
  deleteStaffJobType,
  readStaffJobTypes,
  updateStaffJobTypeLabel,
} from "@/lib/staff-job-types-store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  try {
    const jobTypes = await readStaffJobTypes();
    return NextResponse.json({ jobTypes });
  } catch {
    return NextResponse.json({ message: "failed to load job types" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { label?: string; code?: string };
    const label = typeof body.label === "string" ? body.label : "";
    const code = typeof body.code === "string" ? body.code : undefined;
    const created = await createStaffJobType({ label, code });
    return NextResponse.json({ jobType: created });
  } catch {
    return NextResponse.json({ message: "failed to create job type" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { id?: string; label?: string };
    if (!body.id || typeof body.label !== "string") {
      return NextResponse.json({ message: "invalid payload" }, { status: 400 });
    }
    await updateStaffJobTypeLabel(body.id, body.label);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to update job type" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id required" }, { status: 400 });
  }
  try {
    const result = await deleteStaffJobType(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to delete job type" }, { status: 500 });
  }
}
