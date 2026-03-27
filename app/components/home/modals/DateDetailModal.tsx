"use client";

import type { DateDetailModalProps } from "@/app/components/home/modals/types";

export function DateDetailModal({
  selectedDateDetail,
  setSelectedDateDetail,
  detailStaffByDate,
}: DateDetailModalProps) {
  if (!selectedDateDetail) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">{selectedDateDetail} のスタッフ一覧</p>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
            onClick={() => setSelectedDateDetail(null)}
          >
            閉じる
          </button>
        </div>
        <div className="max-h-80 space-y-2 overflow-auto pr-1">
          {detailStaffByDate(selectedDateDetail).map((item) => (
            <div
              key={`${selectedDateDetail}-${item.member.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ backgroundColor: item.shiftType.color }}
            >
              <span className="text-sm font-medium text-slate-800">{item.member.name}</span>
              <span className="text-xs font-semibold text-slate-700">{item.shiftType.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
