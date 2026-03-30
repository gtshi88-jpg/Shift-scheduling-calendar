"use client";

import type { ConfirmedMonthInfo } from "@/app/types";

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

export type MonthConfirmSectionProps = {
  currentYearMonthKey: string;
  confirmedInfo: ConfirmedMonthInfo | undefined;
  isAdmin: boolean;
  scheduleNotice: string;
  onDismissNotice: () => void;
  onConfirm: () => void | Promise<void>;
  onUnconfirm: () => void | Promise<void>;
};

export function MonthConfirmSection({
  currentYearMonthKey,
  confirmedInfo,
  isAdmin,
  scheduleNotice,
  onDismissNotice,
  onConfirm,
  onUnconfirm,
}: MonthConfirmSectionProps) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">月の確定</h2>
      <p className="mt-1 text-sm text-slate-600">
        表示中の月（{currentYearMonthKey}）を確定すると、一般スタッフはその月のシフトを編集できなくなります。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isAdmin && (
          <>
            {confirmedInfo ? (
              <button
                type="button"
                onClick={() => void onUnconfirm()}
                className="min-h-11 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-100"
              >
                確定を解除
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onConfirm()}
                className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
              >
                この月を確定
              </button>
            )}
          </>
        )}
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            confirmedInfo ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"
          }`}
        >
          {confirmedInfo
            ? `確定済み（${formatTimestamp(confirmedInfo.confirmedAt)}・${confirmedInfo.confirmedBy}）`
            : "未確定（編集中）"}
        </span>
      </div>

      {scheduleNotice ? (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <p>{scheduleNotice}</p>
          <button
            type="button"
            className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs text-rose-800 ring-1 ring-rose-200"
            onClick={onDismissNotice}
          >
            閉じる
          </button>
        </div>
      ) : null}
    </section>
  );
}
