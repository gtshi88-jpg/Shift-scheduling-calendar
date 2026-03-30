"use client";

import type { AuditLogEntry } from "@/app/types";

function formatAuditAction(action: string): string {
  if (action === "save") return "保存";
  if (action === "confirm_month") return "月の確定";
  if (action === "unconfirm_month") return "確定解除";
  return action;
}

function formatDetail(detail: Record<string, unknown>): string {
  const parts: string[] = [];
  const changed = detail.changedCells;
  if (typeof changed === "number") {
    parts.push(`変更セル ${changed} 件`);
  }
  if (detail.staffChanged === true) {
    parts.push("スタッフ情報の変更あり");
  }
  const months = detail.monthsTouched;
  if (Array.isArray(months) && months.length > 0) {
    parts.push(`対象月: ${months.join(", ")}`);
  }
  const ym = detail.yearMonth;
  if (typeof ym === "string") {
    parts.push(`月: ${ym}`);
  }
  return parts.length > 0 ? parts.join(" / ") : "";
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export type ScheduleHistorySectionProps = {
  auditLog: AuditLogEntry[];
};

export function ScheduleHistorySection({ auditLog }: ScheduleHistorySectionProps) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">操作履歴</h2>
      <p className="mt-1 text-sm text-slate-600">直近の保存・確定・確定解除の記録です。</p>

      <div className="mt-4 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-slate-50/80 md:max-h-72">
        {auditLog.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">履歴はまだありません。</p>
        ) : (
          <ul className="divide-y divide-slate-200 text-xs">
            {auditLog.map((entry) => (
              <li key={entry.id} className="px-3 py-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-medium text-slate-800">{formatAuditAction(entry.action)}</span>
                  <span className="text-slate-500">{formatTimestamp(entry.createdAt)}</span>
                  <span className="text-slate-600">{entry.actorUsername}</span>
                </div>
                {formatDetail(entry.detail) ? (
                  <p className="mt-0.5 text-slate-600">{formatDetail(entry.detail)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
