// 日本語でこのファイルの説明をしてください
// このファイルはシフト管理のデータを読み書きするためのファイルです
// このファイルはシフト管理のデータを読み書きするためのファイルです 

import type { DayInfo, ShiftAssignmentMap, StaffMember } from "@/app/types";
import { FALLBACK_STAFF_JOB_TYPE_ID } from "@/app/types";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const SEED_STAFF = ["田中", "佐藤", "鈴木", "高橋"];

const SEED_SHIFTS = ["WORK", "A_SHIFT", "P_SHIFT", "REGULAR_OFF"] as const;

export function createDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toMonthInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthInput(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) {
    return new Date();
  }
  return new Date(year, month - 1, 1);
}

export function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function createMonthDays(date: Date): DayInfo[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const current = new Date(year, month, day);
    const weekDay = current.getDay();
    return {
      key: createDateKey(current),
      day,
      month: month + 1,
      label: `${day}(${WEEKDAY_LABELS[weekDay]})`,
      weekday: WEEKDAY_LABELS[weekDay],
      inMonth: true,
      isWeekend: weekDay === 0 || weekDay === 6,
    };
  });
}

function mondayIndex(dayOfWeek: number): number {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function buildMonthCells(date: Date): DayInfo[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDate = new Date(year, month, 1);
  const startOffset = mondayIndex(firstDate.getDay());
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const dayOfWeek = current.getDay();
    return {
      key: createDateKey(current),
      day: current.getDate(),
      month: current.getMonth() + 1,
      label: `${current.getDate()}(${WEEKDAY_LABELS[dayOfWeek]})`,
      weekday: WEEKDAY_LABELS[dayOfWeek],
      inMonth: current.getMonth() === month,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  });
}

export function createWeekDays(focusDateKey: string): DayInfo[] {
  const focus = new Date(focusDateKey);
  if (Number.isNaN(focus.getTime())) {
    return [];
  }

  const shift = mondayIndex(focus.getDay());
  const monday = new Date(focus);
  monday.setDate(focus.getDate() - shift);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const dayOfWeek = current.getDay();
    return {
      key: createDateKey(current),
      day: current.getDate(),
      month: current.getMonth() + 1,
      label: `${current.getDate()}(${WEEKDAY_LABELS[dayOfWeek]})`,
      weekday: WEEKDAY_LABELS[dayOfWeek],
      inMonth: true,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  });
}

export function createInitialData(monthDate: Date): {
  staff: StaffMember[];
  assignments: ShiftAssignmentMap;
} {
  const monthDays = createMonthDays(monthDate);
  const staff = SEED_STAFF.map((name, index) => ({
    id: `seed-${index + 1}`,
    name,
    jobTypeId: FALLBACK_STAFF_JOB_TYPE_ID,
  }));

  const assignments: ShiftAssignmentMap = {};
  for (const day of monthDays) {
    assignments[day.key] = {};
    for (const [index, member] of staff.entries()) {
      assignments[day.key][member.id] = SEED_SHIFTS[index % SEED_SHIFTS.length];
    }
  }

  return {
    staff,
    assignments,
  };
}
