"use client";

import type { ShiftCode } from "@/app/types";
import type { MonthComparisonSectionProps } from "@/app/components/home/sections/types";

function Delta({ current, baseline }: { current: number; baseline: number }) {
  const d = current - baseline;
  if (d === 0) {
    return <span className="text-slate-500">±0</span>;
  }
  if (d > 0) {
    return <span className="font-semibold text-emerald-700">+{d}</span>;
  }
  return <span className="font-semibold text-rose-700">{d}</span>;
}

export function MonthComparisonSection({
  currentMonthLabel,
  shiftTypes,
  monthlyTotals,
  monthlyTotalsPrevMonth,
  monthlyTotalsPrevYearSameMonth,
  monthComparisonLabels,
}: MonthComparisonSectionProps) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-slate-900">前月・前年同月との比較</h2>
      <p className="mt-1 text-xs text-slate-500">
        ヘッダーで選んだ月（{currentMonthLabel}
        ）の勤務区分ごとの件数を、直前の月・前年同月と比較します。データがない月は0件です。
      </p>
      <div className="mt-4 -mx-1 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="sticky left-0 z-10 bg-white/95 px-2 py-2 font-medium backdrop-blur">区分</th>
              <th className="px-2 py-2 font-medium">今月</th>
              <th className="px-2 py-2 font-medium">{monthComparisonLabels.prevMonth}</th>
              <th className="px-2 py-2 font-medium">前月比</th>
              <th className="px-2 py-2 font-medium">{monthComparisonLabels.prevYearSameMonth}</th>
              <th className="px-2 py-2 font-medium">前年比</th>
            </tr>
          </thead>
          <tbody>
            {shiftTypes.map((type) => {
              const code = type.code as ShiftCode;
              const cur = monthlyTotals[code] ?? 0;
              const pm = monthlyTotalsPrevMonth[code] ?? 0;
              const py = monthlyTotalsPrevYearSameMonth[code] ?? 0;
              return (
                <tr key={`cmp-${type.code}`} className="border-b border-slate-100">
                  <td
                    className="sticky left-0 z-10 bg-white/95 px-2 py-2 font-medium text-slate-800 backdrop-blur"
                    style={{ borderLeft: `3px solid ${type.color}` }}
                  >
                    {type.label}
                  </td>
                  <td className="px-2 py-2 tabular-nums text-slate-900">{cur}</td>
                  <td className="px-2 py-2 tabular-nums text-slate-600">{pm}</td>
                  <td className="px-2 py-2 tabular-nums">
                    <Delta current={cur} baseline={pm} />
                  </td>
                  <td className="px-2 py-2 tabular-nums text-slate-600">{py}</td>
                  <td className="px-2 py-2 tabular-nums">
                    <Delta current={cur} baseline={py} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
