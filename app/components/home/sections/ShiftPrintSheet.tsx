"use client";

import { useMemo } from "react";
import type { DayInfo, ShiftAssignmentMap, ShiftCode, ShiftType, StaffMember } from "@/app/types";
import { getMonthLabel } from "@/app/utils/schedule";

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

type ShiftPrintSheetProps = {
  currentMonth: Date;
  monthCells: DayInfo[];
  assignments: ShiftAssignmentMap;
  getPreviewStaffByDate: (dateKey: string) => StaffMember[];
  getShiftType: (code: ShiftCode | undefined) => ShiftType;
  showRegularOffInMonth: boolean;
  isConfirmed: boolean;
};

export function ShiftPrintSheet({
  currentMonth,
  monthCells,
  assignments,
  getPreviewStaffByDate,
  getShiftType,
  showRegularOffInMonth,
  isConfirmed,
}: ShiftPrintSheetProps) {
  const printedAtLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
    [],
  );

  return (
    <div className="shift-print-root hidden bg-white text-black print:block print:py-2">
      <div className="shift-print-colors mx-auto max-w-[297mm] px-3 py-4 print:max-w-none print:px-4">
        <header className="mb-3 border-b border-slate-300 pb-3">
          <h1 className="text-xl font-bold tracking-tight">シフト表（カレンダー）</h1>
          <p className="mt-1 text-sm text-slate-700">{getMonthLabel(currentMonth)}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            <span>{isConfirmed ? "状態: 確定済み" : "状態: 未確定（ドラフト）"}</span>
            <span>印刷日時: {printedAtLabel}</span>
            <span>{showRegularOffInMonth ? "公休: 表示" : "公休: 非表示（画面の設定に準拠）"}</span>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((weekday) => (
            <div
              key={weekday}
              className={`rounded-md py-1.5 text-center text-[11px] font-semibold print:py-1 print:text-[10px] ${
                weekday === "土"
                  ? "bg-blue-50 text-blue-800"
                  : weekday === "日"
                    ? "bg-rose-50 text-rose-800"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {weekday}
            </div>
          ))}
          {monthCells.map((cell) => (
            <div
              key={`print-cal-${cell.key}`}
              className={`break-inside-avoid flex min-h-[5.5rem] flex-col rounded-lg border p-1.5 print:min-h-[4.8rem] print:p-1 print:text-[9px] ${
                cell.inMonth
                  ? "border-slate-300 bg-white"
                  : "border-slate-100 bg-slate-50/90 text-slate-400"
              }`}
            >
              <div
                className={`text-[11px] font-semibold leading-none print:text-[10px] ${
                  cell.isWeekend ? "text-rose-600" : "text-slate-600"
                }`}
              >
                {cell.day}
              </div>
              <div className="mt-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {getPreviewStaffByDate(cell.key).map((member) => {
                  const shiftCode = assignments[cell.key]?.[member.id];
                  const shiftType = getShiftType(shiftCode);
                  if (!shiftCode) {
                    return null;
                  }
                  if (shiftCode === "REGULAR_OFF" && !showRegularOffInMonth) {
                    return null;
                  }
                  return (
                    <div
                      key={`${cell.key}-${member.id}`}
                      className="truncate rounded px-1 py-0.5 text-left text-[9px] leading-tight text-slate-800 shadow-sm print:text-[8px]"
                      style={{ backgroundColor: shiftType.color }}
                      title={`${member.name} ${shiftType.label}`}
                    >
                      <span className="font-medium">{member.name}</span>
                      <span className="ml-0.5 opacity-90">{shiftType.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-4 border-t border-slate-200 pt-3 text-[10px] text-slate-600 print:text-[9px]">
          <p>
            色は勤務区分を表します。ブラウザの印刷設定で「背景のグラフィック」または「背景を印刷」を有効にすると、画面に近い色で出力されます。
          </p>
        </footer>
      </div>
    </div>
  );
}
