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

/** DB staff_job_types と対応（一覧は API から取得） */
export type StaffJobTypeRecord = {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
};

/** 表示フィルタ: 全員 or 職種マスタの id */
export type StaffJobFilter = "all" | string;

/** オフライン用シード・フォールバック（schema.sql の counselor 行と一致） */
export const FALLBACK_STAFF_JOB_TYPE_ID = "00000001-0000-4000-8000-000000000001";

export function defaultStaffJobTypesSeed(): StaffJobTypeRecord[] {
  return [
    {
      id: FALLBACK_STAFF_JOB_TYPE_ID,
      code: "counselor",
      label: "カウンセラー",
      sortOrder: 0,
    },
    {
      id: "00000002-0000-4000-8000-000000000002",
      code: "doctor",
      label: "ドクター",
      sortOrder: 1,
    },
    {
      id: "00000003-0000-4000-8000-000000000003",
      code: "nurse",
      label: "ナース",
      sortOrder: 2,
    },
  ];
}

export type StaffMember = {
  id: string;
  name: string;
  jobTypeId: string;
  activeFrom?: string | null;
  activeTo?: string | null;
};

export function normalizeStaffJobTypeId(value: unknown, fallbackId: string): string {
  if (typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)) {
    return value;
  }
  return fallbackId;
}

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

export type ConfirmedMonthInfo = {
  yearMonth: string;
  confirmedAt: string;
  confirmedBy: string;
};

export type AuditLogEntry = {
  id: string;
  createdAt: string;
  actorUsername: string;
  action: string;
  detail: Record<string, unknown>;
};
