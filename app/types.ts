// 日本語でこのファイルの説明をしてください
// このファイルはシフト管理のデータを読み書きするためのファイルです
// このファイルはシフト管理のデータを読み書きするためのファイルです

export type UserRole = "admin" | "member";
export type ViewMode = "month" | "week";
export type AuthUser = {
  username: string;
  role: UserRole;
};

export type ShiftCode =
  | "WORK"
  | "ABSENT"
  | "PAID_LEAVE"
  | "REQUEST_OFF"
  | "REGULAR_OFF"
  | "A_SHIFT"
  | "P_SHIFT";

export type ShiftType = {
  code: ShiftCode;
  label: string;
  color: string;
};

export type StaffMember = {
  id: string;
  name: string;
  activeFrom?: string | null;
  activeTo?: string | null;
};

export type ShiftAssignmentMap = Record<string, Record<string, ShiftCode>>;

export type DayInfo = {
  key: string;
  day: number;
  month: number;
  label: string;
  weekday: string;
  inMonth: boolean;
  isWeekend: boolean;
};
