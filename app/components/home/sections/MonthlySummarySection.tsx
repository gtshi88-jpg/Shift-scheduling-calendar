"use client";

import { getMonthLabel } from "@/app/utils/schedule";
import type { MonthlySummarySectionProps } from "@/app/components/home/sections/types";

export function MonthlySummarySection({
  currentMonth,
  shiftTypes,
  monthlyTotals,
  showMonthlySummaryMobile,
  setShowMonthlySummaryMobile,
}: MonthlySummarySectionProps) {
  return (
    <>
      <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">月間サマリー</h2>
            <p className="mt-1 text-xs text-slate-500">{getMonthLabel(currentMonth)} の集計</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
            onClick={() => setShowMonthlySummaryMobile((prev) => !prev)}
          >
            {showMonthlySummaryMobile ? "閉じる" : "表示"}
          </button>
        </div>
        {showMonthlySummaryMobile && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {shiftTypes.map((type) => (
              <div
                key={`summary-mobile-${type.code}`}
                className="rounded-2xl border border-slate-200 p-3 shadow-sm"
                style={{ backgroundColor: type.color }}
              >
                <p className="text-xs text-slate-600">{type.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{monthlyTotals[type.code]}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hidden rounded-3xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur md:block md:p-6">
        <h2 className="text-lg font-semibold">月間サマリー</h2>
        <p className="mt-1 text-xs text-slate-500">{getMonthLabel(currentMonth)} の集計</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {shiftTypes.map((type) => (
            <div
              key={`summary-${type.code}`}
              className="rounded-2xl border border-slate-200 p-3 shadow-sm"
              style={{ backgroundColor: type.color }}
            >
              <p className="text-xs text-slate-600">{type.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{monthlyTotals[type.code]}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
