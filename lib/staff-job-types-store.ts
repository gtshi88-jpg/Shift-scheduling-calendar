import { randomUUID } from "node:crypto";

import type { StaffJobTypeRecord } from "@/app/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Row = {
  id: string;
  code: string;
  label: string;
  sort_order: number;
};

export async function readStaffJobTypes(): Promise<StaffJobTypeRecord[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff_job_types")
    .select("id,code,label,sort_order")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) {
    throw error;
  }
  return (data as Row[]).map((row) => ({
    id: row.id,
    code: row.code,
    label: row.label,
    sortOrder: row.sort_order,
  }));
}

function slugifyCode(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  if (base.length > 0) {
    return base.startsWith("_") ? `j${base}` : base;
  }
  return `j_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function createStaffJobType(args: { label: string; code?: string }): Promise<StaffJobTypeRecord> {
  const supabase = createSupabaseServerClient();
  const label = args.label.trim();
  if (!label) {
    throw new Error("label required");
  }
  let code = args.code?.trim() ? slugifyCode(args.code) : slugifyCode(label);
  if (!/^[a-z][a-z0-9_]*$/.test(code)) {
    code = `j_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  const { data: maxRow } = await supabase
    .from("staff_job_types")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("staff_job_types")
    .insert({ code, label, sort_order: sortOrder })
    .select("id,code,label,sort_order")
    .single();
  if (error) {
    throw error;
  }
  const row = data as Row;
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    sortOrder: row.sort_order,
  };
}

export async function updateStaffJobTypeLabel(id: string, label: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error("label required");
  }
  const { error } = await supabase.from("staff_job_types").update({ label: trimmed }).eq("id", id);
  if (error) {
    throw error;
  }
}

export async function deleteStaffJobType(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = createSupabaseServerClient();
  const { count, error: countError } = await supabase
    .from("staff_members")
    .select("id", { count: "exact", head: true })
    .eq("job_type_id", id);
  if (countError) {
    throw countError;
  }
  if ((count ?? 0) > 0) {
    return { ok: false, message: "この職種に所属するスタッフがいるため削除できません。" };
  }
  const { error } = await supabase.from("staff_job_types").delete().eq("id", id);
  if (error) {
    throw error;
  }
  return { ok: true };
}
