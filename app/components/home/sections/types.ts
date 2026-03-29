"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  AuthUser,
  DayInfo,
  ShiftAssignmentMap,
  ShiftCode,
  ShiftType,
  StaffJobFilter,
  StaffMember,
  ViewMode,
} from "@/app/types";

export type InputMode = "table" | "calendar";
export type TableRangeMode = "all" | "firstHalf" | "secondHalf";
export type PreviewSortMode = "presentFirst" | "createdOrder" | "name";

export type TotalsByMember = Record<
  string,
  { work: number; absent: number; paidLeave: number; requestOff: number; regularOff: number }
>;
export type TotalsByDate = Record<
  string,
  { work: number; absent: number; paidLeave: number; requestOff: number; regularOff: number }
>;

export type LoginViewProps = {
  handleLogin: (event: FormEvent<HTMLFormElement>) => void;
  loginUsername: string;
  setLoginUsername: (value: string) => void;
  loginPassword: string;
  setLoginPassword: (value: string) => void;
  loginError: string;
  /** 認証 API 〜 シフト取得中 */
  loginBusy: boolean;
};

export type HeaderSectionProps = {
  isAdmin: boolean;
  user: AuthUser;
  handleLogout: () => void;
  currentMonth: Date;
  saveStatus: "idle" | "saving" | "error";
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  moveMonth: (delta: number) => void;
  setCurrentMonth: (value: Date) => void;
  /** false のとき表/カレンダー切替を非表示（ダッシュボード等） */
  showInputModeToggle?: boolean;
  staffJobFilter: StaffJobFilter;
  setStaffJobFilter: Dispatch<SetStateAction<StaffJobFilter>>;
  staffJobFilterOptions: { value: StaffJobFilter; label: string }[];
};

export type TodayStatusSectionProps = {
  todayKey: string;
  todayWorkingCount: number;
  todayTargetHeadcount: number;
  mobileTodayPresent: StaffMember[];
  mobileTodayAbsent: StaffMember[];
  assignments: ShiftAssignmentMap;
  getShiftType: (code: ShiftCode | undefined) => ShiftType;
};

export type MonthlySummarySectionProps = {
  currentMonth: Date;
  shiftTypes: ShiftType[];
  monthlyTotals: Record<ShiftCode, number>;
  showMonthlySummaryMobile: boolean;
  setShowMonthlySummaryMobile: Dispatch<SetStateAction<boolean>>;
};

export type MonthComparisonSectionProps = {
  currentMonthLabel: string;
  shiftTypes: ShiftType[];
  monthlyTotals: Record<ShiftCode, number>;
  monthlyTotalsPrevMonth: Record<ShiftCode, number>;
  monthlyTotalsPrevYearSameMonth: Record<ShiftCode, number>;
  monthComparisonLabels: { prevMonth: string; prevYearSameMonth: string };
};

export type TableInputSectionProps = {
  inputMode: InputMode;
  tableRangeMode: TableRangeMode;
  setTableRangeMode: (mode: TableRangeMode) => void;
  targetWeekday: number;
  setTargetWeekday: (value: number) => void;
  targetWeekend: number;
  setTargetWeekend: (value: number) => void;
  targetHoliday: number;
  setTargetHoliday: (value: number) => void;
  showTableOptions: boolean;
  setShowTableOptions: Dispatch<SetStateAction<boolean>>;
  holidayDatesInput: string;
  setHolidayDatesInput: (value: string) => void;
  isAdmin: boolean;
  setAddStaffModalOpen: Dispatch<SetStateAction<boolean>>;
  setCsvImportOpen: Dispatch<SetStateAction<boolean>>;
  visibleMonthDays: DayInfo[];
  monthVisibleStaff: StaffMember[];
  assignments: ShiftAssignmentMap;
  user: AuthUser | null;
  getShiftType: (code: ShiftCode | undefined) => ShiftType;
  selectableShiftTypes: (currentCode?: ShiftCode) => ShiftType[];
  shiftShortLabel: Record<ShiftCode, string>;
  updateAssignment: (dateKey: string, staffId: string, code: ShiftCode) => void;
  memberMonthLocked: boolean;
  totalsByStaff: TotalsByMember;
  totalsByDate: TotalsByDate;
  /** 合計列の集計対象日数（当月の暦日数 28〜31） */
  monthDaysInMonth: number;
  workingCountByDate: Record<string, number>;
  targetByDate: Record<string, number>;
  staffingBalanceSummary: { shortageDays: number; surplusDays: number; exactDays: number };
  moveStaff: (staffId: string, direction: -1 | 1) => Promise<void>;
  removeStaff: (staffId: string) => Promise<void>;
};

export type CalendarPreviewSectionProps = {
  currentMonth: Date;
  previewSortMode: PreviewSortMode;
  setPreviewSortMode: (mode: PreviewSortMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showRegularOffInMonth: boolean;
  setShowRegularOffInMonth: Dispatch<SetStateAction<boolean>>;
  monthCells: DayInfo[];
  weekDays: DayInfo[];
  weekFocusDate: string;
  setWeekFocusDate: (value: string) => void;
  moveWeek: (deltaDays: number) => void;
  setWeekToToday: () => void;
  getPreviewStaffByDate: (dateKey: string) => StaffMember[];
  assignments: ShiftAssignmentMap;
  getShiftType: (code: ShiftCode | undefined) => ShiftType;
  user: AuthUser | null;
  inputMode: InputMode;
  openCalendarEditor: (dateKey: string, preferredStaffId?: string) => void;
  setSelectedDateDetail: Dispatch<SetStateAction<string | null>>;
  calendarEditingLocked: boolean;
  onPrint: () => void;
  /** true のときカレンダー上の編集UIを出さない（シフト確認タブ用） */
  readOnly?: boolean;
};
