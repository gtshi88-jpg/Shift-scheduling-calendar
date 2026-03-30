"use client";

import type { TodayStatusSectionProps } from "@/app/components/home/sections/types";

export function TodayStatusSection({
  todayKey,
  todayWorkingCount,
  todayTargetHeadcount,
  mobileTodayPresent,
  mobileTodayAbsent,
  assignments,
  getShiftType,
}: TodayStatusSectionProps) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">今日の出勤状況</h2>
        <span className="text-xs text-slate-500">{todayKey}</span>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">稼働人数 / 目標</p>
        <p className="mt-1 text-lg font-bold text-slate-900">
          {todayWorkingCount} / {todayTargetHeadcount}
          <span
            className={`ml-2 text-sm ${
              todayWorkingCount - todayTargetHeadcount < 0
                ? "text-rose-700"
                : todayWorkingCount - todayTargetHeadcount > 0
                  ? "text-emerald-700"
                  : "text-slate-500"
            }`}
          >
            ({todayWorkingCount - todayTargetHeadcount >= 0 ? "+" : ""}
            {todayWorkingCount - todayTargetHeadcount})
          </span>
        </p>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-600">出勤中</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {mobileTodayPresent.length === 0 && <span className="text-xs text-slate-400">出勤者なし</span>}
          {mobileTodayPresent.map((member) => {
            const code = assignments[todayKey]?.[member.id] ?? "WORK";
            const shiftType = getShiftType(code);
            return (
              <span
                key={`present-${member.id}`}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: shiftType.color }}
              >
                {member.name} {shiftType.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-600">不在（休暇/公休/欠勤）</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {mobileTodayAbsent.length === 0 && <span className="text-xs text-slate-400">不在者なし</span>}
          {mobileTodayAbsent.map((member) => {
            const code = assignments[todayKey]?.[member.id] ?? "WORK";
            const shiftType = getShiftType(code);
            return (
              <span
                key={`absent-${member.id}`}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: shiftType.color }}
              >
                {member.name} {shiftType.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
