// 


"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AuthUser,
  ShiftAssignmentMap,
  ShiftCode,
  ShiftType,
  StaffMember,
  ViewMode,
} from "@/app/types";
import { buildMonthCells, createInitialData, createMonthDays, createWeekDays } from "@/app/utils/schedule";

type InputMode = "table" | "calendar";
type TableRangeMode = "all" | "firstHalf" | "secondHalf";
type PreviewSortMode = "presentFirst" | "createdOrder" | "name";
type CsvImportPreview = {
  staff: StaffMember[];
  assignments: ShiftAssignmentMap;
  parsedDates: string[];
};

export const SHIFT_TYPES: ShiftType[] = [
  { code: "WORK", label: "出勤", color: "#bfdbfe" },
  { code: "ABSENT", label: "欠勤", color: "#bbf7d0" },
  { code: "PAID_LEAVE", label: "有給", color: "#fde68a" },
  { code: "REQUEST_OFF", label: "希望休", color: "#fbcfe8" },
  { code: "REGULAR_OFF", label: "公休", color: "#fecaca" },
  { code: "A_SHIFT", label: "A勤", color: "#bbf7d0" },
  { code: "P_SHIFT", label: "P勤", color: "#ddd6fe" },
];
const MEMBER_EDITABLE_CODES: ShiftCode[] = ["PAID_LEAVE", "REQUEST_OFF"];
const SHIFT_MAP = Object.fromEntries(SHIFT_TYPES.map((shift) => [shift.code, shift])) as Record<
  ShiftCode,
  ShiftType
>;
export const SHIFT_SHORT_LABEL: Record<ShiftCode, string> = {
  WORK: "出",
  ABSENT: "欠",
  PAID_LEAVE: "有",
  REQUEST_OFF: "希",
  REGULAR_OFF: "休",
  A_SHIFT: "A",
  P_SHIFT: "P",
};
const LEGACY_SHIFT_CODE_MAP: Record<string, ShiftCode> = {
  OFF: "REGULAR_OFF",
  MORNING: "A_SHIFT",
  DAY: "WORK",
  LATE: "P_SHIFT",
  NIGHT: "P_SHIFT",
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((cell) => cell.trim());
}

function normalizeShiftToken(token: string): ShiftCode | null {
  const normalized = token.trim();
  if (normalized === "") {
    return "REGULAR_OFF";
  }
  const map: Record<string, ShiftCode> = {
    WORK: "WORK",
    ABSENT: "ABSENT",
    PAID_LEAVE: "PAID_LEAVE",
    REQUEST_OFF: "REQUEST_OFF",
    REGULAR_OFF: "REGULAR_OFF",
    A_SHIFT: "A_SHIFT",
    P_SHIFT: "P_SHIFT",
    出勤: "WORK",
    欠勤: "ABSENT",
    有給: "PAID_LEAVE",
    希望休: "REQUEST_OFF",
    公休: "REGULAR_OFF",
    A勤: "A_SHIFT",
    P勤: "P_SHIFT",
    出: "WORK",
    欠: "ABSENT",
    有: "PAID_LEAVE",
    希: "REQUEST_OFF",
    公: "REGULAR_OFF",
    A: "A_SHIFT",
    P: "P_SHIFT",
  };
  return map[normalized] ?? null;
}

function parseShiftCsv(text: string): { preview: CsvImportPreview | null; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    return { preview: null, errors: ["CSVにデータ行がありません"] };
  }
  const header = parseCsvLine(lines[0]);
  if (header.length < 2) {
    return { preview: null, errors: ["ヘッダー形式が不正です"] };
  }
  const dateColumns = header.slice(1);
  for (const date of dateColumns) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`日付ヘッダーの形式が不正です: ${date}`);
    }
  }
  if (errors.length > 0) {
    return { preview: null, errors };
  }
  const staff: StaffMember[] = [];
  const assignments: ShiftAssignmentMap = {};
  const firstDate = dateColumns[0];
  const defaultActiveFrom = firstDate ? `${firstDate.slice(0, 7)}-01` : null;
  for (const date of dateColumns) {
    assignments[date] = {};
  }
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const row = parseCsvLine(lines[rowIndex]);
    const name = row[0]?.trim();
    if (!name) {
      errors.push(`${rowIndex + 1}行目: スタッフ名が空です`);
      continue;
    }
    const memberId = crypto.randomUUID();
    staff.push({ id: memberId, name, activeFrom: defaultActiveFrom, activeTo: null });
    for (let col = 0; col < dateColumns.length; col += 1) {
      const dateKey = dateColumns[col];
      const token = row[col + 1] ?? "";
      const code = normalizeShiftToken(token);
      if (!code) {
        errors.push(`${rowIndex + 1}行目 ${dateKey}: 勤務区分「${token}」は未対応です`);
        continue;
      }
      assignments[dateKey][memberId] = code;
    }
  }
  if (errors.length > 0) {
    return { preview: null, errors };
  }
  return { preview: { staff, assignments, parsedDates: dateColumns }, errors: [] };
}

function normalizeShiftCode(code: unknown): ShiftCode {
  if (typeof code !== "string") {
    return "REGULAR_OFF";
  }
  if (code in SHIFT_MAP) {
    return code as ShiftCode;
  }
  if (code in LEGACY_SHIFT_CODE_MAP) {
    return LEGACY_SHIFT_CODE_MAP[code];
  }
  return "REGULAR_OFF";
}

function normalizeAssignments(assignments: ShiftAssignmentMap): ShiftAssignmentMap {
  const normalized: ShiftAssignmentMap = {};
  for (const [dateKey, byStaff] of Object.entries(assignments ?? {})) {
    normalized[dateKey] = {};
    for (const [staffId, rawCode] of Object.entries(byStaff ?? {})) {
      normalized[dateKey][staffId] = normalizeShiftCode(rawCode);
    }
  }
  return normalized;
}

function isWorkingShift(code: ShiftCode | undefined): boolean {
  return code === "WORK" || code === "A_SHIFT" || code === "P_SHIFT";
}

function buildMiniCalendarCells(baseMonth: Date) {
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const startDate = new Date(year, month, 1 - firstDay);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: date.getDate(),
      date,
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

function getMonthStartKey(baseMonth: Date): string {
  const year = baseMonth.getFullYear();
  const month = String(baseMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function getMonthEndKey(baseMonth: Date): string {
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const endDate = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`;
}

function isStaffActiveForRange(member: StaffMember, rangeStart: string, rangeEnd: string): boolean {
  const activeFrom = member.activeFrom ?? "0001-01-01";
  const activeTo = member.activeTo ?? "9999-12-31";
  return activeFrom <= rangeEnd && activeTo >= rangeStart;
}

function isStaffActiveOnDate(member: StaffMember, dateKey: string): boolean {
  return isStaffActiveForRange(member, dateKey, dateKey);
}

export function useHomePageController() {
  const fallback = createInitialData(new Date(2026, 2, 1));
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 2, 1));
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [inputMode, setInputMode] = useState<InputMode>("calendar");
  const [tableRangeMode, setTableRangeMode] = useState<TableRangeMode>("firstHalf");
  const [targetWeekday, setTargetWeekday] = useState(3);
  const [targetWeekend, setTargetWeekend] = useState(2);
  const [targetHoliday, setTargetHoliday] = useState(2);
  const [holidayDatesInput, setHolidayDatesInput] = useState("");
  const [showRegularOffInMonth, setShowRegularOffInMonth] = useState(false);
  const [previewSortMode, setPreviewSortMode] = useState<PreviewSortMode>("presentFirst");
  const [weekFocusDate, setWeekFocusDate] = useState("2026-03-01");
  const [staff, setStaff] = useState<StaffMember[]>(fallback.staff);
  const [assignments, setAssignments] = useState<ShiftAssignmentMap>(fallback.assignments);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [showMonthlySummaryMobile, setShowMonthlySummaryMobile] = useState(false);
  const [showTableOptions, setShowTableOptions] = useState(false);
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvImportErrors, setCsvImportErrors] = useState<string[]>([]);
  const [csvImportPreview, setCsvImportPreview] = useState<CsvImportPreview | null>(null);
  const [calendarEditor, setCalendarEditor] = useState<{
    dateKey: string;
    staffId: string;
    code: ShiftCode;
  } | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const authRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!authRes.ok) return;
        const authPayload = (await authRes.json()) as { authenticated: boolean; user: AuthUser };
        if (!authPayload.authenticated) return;
        setUser(authPayload.user);
        const shiftRes = await fetch("/api/shifts", { cache: "no-store" });
        if (!shiftRes.ok) return;
        const shiftPayload = (await shiftRes.json()) as {
          staff: StaffMember[];
          assignments: ShiftAssignmentMap;
        };
        setStaff(shiftPayload.staff);
        setAssignments(normalizeAssignments(shiftPayload.assignments));
      } finally {
        setAuthLoading(false);
      }
    }
    void bootstrap();
  }, []);

  const persistData = async (nextStaff: StaffMember[], nextAssignments: ShiftAssignmentMap) => {
    if (!user || user.role !== "admin") return false;
    setSaveStatus("saving");
    const response = await fetch("/api/shifts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff: nextStaff, assignments: nextAssignments }),
    });
    if (!response.ok) {
      setSaveStatus("error");
      return false;
    }
    setSaveStatus("idle");
    return true;
  };

  const monthDays = useMemo(() => createMonthDays(currentMonth), [currentMonth]);
  const currentMonthStartKey = useMemo(() => getMonthStartKey(currentMonth), [currentMonth]);
  const currentMonthEndKey = useMemo(() => getMonthEndKey(currentMonth), [currentMonth]);
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);
  const monthVisibleStaff = useMemo(
    () => staff.filter((member) => isStaffActiveForRange(member, currentMonthStartKey, currentMonthEndKey)),
    [currentMonthEndKey, currentMonthStartKey, staff],
  );
  const visibleMonthDays = useMemo(() => {
    if (tableRangeMode === "all") return monthDays;
    if (tableRangeMode === "firstHalf") return monthDays.filter((day) => day.day <= 16);
    return monthDays.filter((day) => day.day >= 17);
  }, [monthDays, tableRangeMode]);
  const monthCells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);
  const weekDays = useMemo(() => createWeekDays(weekFocusDate), [weekFocusDate]);
  const miniCalendarCells = useMemo(() => buildMiniCalendarCells(currentMonth), [currentMonth]);
  const holidayDateSet = useMemo(
    () =>
      new Set(
        holidayDatesInput
          .split(",")
          .map((value) => value.trim())
          .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)),
      ),
    [holidayDatesInput],
  );
  const warnings = useMemo(() => {
    const knownStaff = new Set(staff.map((member) => member.id));
    const validCodes = new Set(SHIFT_TYPES.map((type) => type.code));
    const messages: string[] = [];
    for (const [date, byStaff] of Object.entries(assignments)) {
      for (const [staffId, code] of Object.entries(byStaff)) {
        if (!knownStaff.has(staffId)) messages.push(`${date}: 不明なスタッフ(${staffId})のデータがあります`);
        if (!validCodes.has(code as ShiftCode)) messages.push(`${date}: 不明な勤務区分(${code})があります`);
      }
    }
    return messages;
  }, [staff, assignments]);
  const monthlyTotals = useMemo(() => {
    const totals: Record<ShiftCode, number> = {
      WORK: 0,
      ABSENT: 0,
      PAID_LEAVE: 0,
      REQUEST_OFF: 0,
      REGULAR_OFF: 0,
      A_SHIFT: 0,
      P_SHIFT: 0,
    };
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
    for (const [dateKey, byStaff] of Object.entries(assignments)) {
      if (!dateKey.startsWith(monthKey)) continue;
      for (const [staffId, code] of Object.entries(byStaff)) {
        const member = staffById.get(staffId);
        if (!member || !isStaffActiveOnDate(member, dateKey)) continue;
        if (code in totals) totals[code as ShiftCode] += 1;
      }
    }
    return totals;
  }, [assignments, currentMonth, staffById]);
  const totalsByStaff = useMemo(() => {
    const result: Record<string, { work: number; absent: number; paidLeave: number; requestOff: number }> = {};
    for (const member of monthVisibleStaff) result[member.id] = { work: 0, absent: 0, paidLeave: 0, requestOff: 0 };
    for (const day of monthDays) {
      const byStaff = assignments[day.key] ?? {};
      for (const member of monthVisibleStaff) {
        const code = byStaff[member.id] ?? "REGULAR_OFF";
        if (code === "WORK") result[member.id].work += 1;
        if (code === "ABSENT") result[member.id].absent += 1;
        if (code === "PAID_LEAVE") result[member.id].paidLeave += 1;
        if (code === "REQUEST_OFF") result[member.id].requestOff += 1;
      }
    }
    return result;
  }, [assignments, monthDays, monthVisibleStaff]);
  const totalsByDate = useMemo(() => {
    const result: Record<string, { work: number; absent: number; paidLeave: number; requestOff: number }> = {};
    for (const day of monthDays) {
      result[day.key] = { work: 0, absent: 0, paidLeave: 0, requestOff: 0 };
      const byStaff = assignments[day.key] ?? {};
      const dateStaff = staff.filter((member) => isStaffActiveOnDate(member, day.key));
      for (const member of dateStaff) {
        const code = byStaff[member.id] ?? "REGULAR_OFF";
        if (code === "WORK") result[day.key].work += 1;
        if (code === "ABSENT") result[day.key].absent += 1;
        if (code === "PAID_LEAVE") result[day.key].paidLeave += 1;
        if (code === "REQUEST_OFF") result[day.key].requestOff += 1;
      }
    }
    return result;
  }, [assignments, monthDays, staff]);
  const workingCountByDate = useMemo(() => {
    const result: Record<string, number> = {};
    for (const day of monthDays) {
      let count = 0;
      const byStaff = assignments[day.key] ?? {};
      const dateStaff = staff.filter((member) => isStaffActiveOnDate(member, day.key));
      for (const member of dateStaff) {
        const code = byStaff[member.id] ?? "REGULAR_OFF";
        if (code === "WORK" || code === "A_SHIFT" || code === "P_SHIFT") count += 1;
      }
      result[day.key] = count;
    }
    return result;
  }, [assignments, monthDays, staff]);
  const targetByDate = useMemo(() => {
    const result: Record<string, number> = {};
    for (const day of monthDays) {
      if (holidayDateSet.has(day.key)) result[day.key] = targetHoliday;
      else if (day.isWeekend) result[day.key] = targetWeekend;
      else result[day.key] = targetWeekday;
    }
    return result;
  }, [monthDays, holidayDateSet, targetHoliday, targetWeekend, targetWeekday]);
  const staffingBalanceSummary = useMemo(() => {
    let shortageDays = 0;
    let surplusDays = 0;
    let exactDays = 0;
    for (const day of monthDays) {
      const working = workingCountByDate[day.key] ?? 0;
      const diff = working - (targetByDate[day.key] ?? 0);
      if (diff < 0) shortageDays += 1;
      else if (diff > 0) surplusDays += 1;
      else exactDays += 1;
    }
    return { shortageDays, surplusDays, exactDays };
  }, [monthDays, targetByDate, workingCountByDate]);

  const isAdmin = user?.role === "admin";
  const isMember = user?.role === "member";

  const moveMonth = (delta: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    setCurrentMonth(next);
  };
  const moveWeek = (deltaDays: number) => {
    const base = new Date(weekFocusDate);
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + deltaDays);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    setWeekFocusDate(`${y}-${m}-${d}`);
  };
  const setWeekToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setWeekFocusDate(`${y}-${m}-${d}`);
  };
  const getPreviewStaffByDate = (dateKey: string) => {
    const dateStaff = staff.filter((member) => isStaffActiveOnDate(member, dateKey));
    if (previewSortMode === "createdOrder") return dateStaff;
    if (previewSortMode === "name") return [...dateStaff].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return [...dateStaff].sort((a, b) => {
      const aWorking = isWorkingShift(assignments[dateKey]?.[a.id]);
      const bWorking = isWorkingShift(assignments[dateKey]?.[b.id]);
      if (aWorking === bWorking) return 0;
      return aWorking ? -1 : 1;
    });
  };
  const detailStaffByDate = (dateKey: string) =>
    getPreviewStaffByDate(dateKey).map((member) => {
      const code = assignments[dateKey]?.[member.id] ?? "REGULAR_OFF";
      return { member, code, shiftType: SHIFT_MAP[code] ?? SHIFT_MAP.REGULAR_OFF };
    });
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const todayTargetHeadcount = useMemo(() => {
    const todayDate = new Date(todayKey);
    if (holidayDateSet.has(todayKey)) return targetHoliday;
    return todayDate.getDay() === 0 || todayDate.getDay() === 6 ? targetWeekend : targetWeekday;
  }, [holidayDateSet, targetHoliday, targetWeekend, targetWeekday, todayKey]);
  const mobileTodaySortedStaff = getPreviewStaffByDate(todayKey);
  const todayWorkingCount = useMemo(
    () => mobileTodaySortedStaff.filter((member) => isWorkingShift(assignments[todayKey]?.[member.id] ?? "REGULAR_OFF")).length,
    [assignments, mobileTodaySortedStaff, todayKey],
  );
  const mobileTodayPresent = useMemo(
    () => mobileTodaySortedStaff.filter((member) => isWorkingShift(assignments[todayKey]?.[member.id] ?? "REGULAR_OFF")),
    [assignments, mobileTodaySortedStaff, todayKey],
  );
  const mobileTodayAbsent = useMemo(
    () => mobileTodaySortedStaff.filter((member) => !isWorkingShift(assignments[todayKey]?.[member.id] ?? "REGULAR_OFF")),
    [assignments, mobileTodaySortedStaff, todayKey],
  );
  const getShiftType = (code: ShiftCode | undefined): ShiftType => (code ? SHIFT_MAP[code] ?? SHIFT_MAP.REGULAR_OFF : SHIFT_MAP.REGULAR_OFF);
  const selectableShiftTypes = (currentCode?: ShiftCode) => {
    if (isAdmin) return SHIFT_TYPES;
    const base = SHIFT_TYPES.filter((type) => MEMBER_EDITABLE_CODES.includes(type.code));
    if (currentCode && !MEMBER_EDITABLE_CODES.includes(currentCode)) return [SHIFT_MAP[currentCode], ...base];
    return base;
  };
  const updateAssignment = (dateKey: string, staffId: string, code: ShiftCode) => {
    if (!user) return;
    if (!isAdmin && !isMember) return;
    if (isMember && !MEMBER_EDITABLE_CODES.includes(code)) return;
    const nextAssignments = { ...assignments, [dateKey]: { ...(assignments[dateKey] ?? {}), [staffId]: code } };
    setAssignments(nextAssignments);
    void persistData(staff, nextAssignments);
  };
  const openCalendarEditor = (dateKey: string, preferredStaffId?: string) => {
    const dateStaff = getPreviewStaffByDate(dateKey);
    if (!user || dateStaff.length === 0) return;
    const selectedStaffId =
      preferredStaffId && dateStaff.some((member) => member.id === preferredStaffId) ? preferredStaffId : dateStaff[0].id;
    const currentCode = assignments[dateKey]?.[selectedStaffId] ?? "REGULAR_OFF";
    const existingCode = isMember && !MEMBER_EDITABLE_CODES.includes(currentCode) ? "REQUEST_OFF" : currentCode;
    setCalendarEditor({ dateKey, staffId: selectedStaffId, code: existingCode });
  };
  const applyCalendarEditor = () => {
    if (!calendarEditor) return;
    updateAssignment(calendarEditor.dateKey, calendarEditor.staffId, calendarEditor.code);
    setCalendarEditor(null);
  };
  const addStaff = async (nameInput: string) => {
    if (!isAdmin) return;
    const name = nameInput.trim();
    if (!name) return;
    const item: StaffMember = { id: crypto.randomUUID(), name, activeFrom: currentMonthStartKey, activeTo: null };
    const nextStaff = [...staff, item];
    const nextAssignments: ShiftAssignmentMap = {};
    for (const [dateKey, byStaff] of Object.entries(assignments)) {
      nextAssignments[dateKey] = { ...byStaff, [item.id]: "WORK" };
    }
    setStaff(nextStaff);
    setAssignments(nextAssignments);
    await persistData(nextStaff, nextAssignments);
  };
  const submitAddStaff = async () => {
    await addStaff(newStaffName);
    setNewStaffName("");
    setAddStaffModalOpen(false);
  };
  const removeStaff = async (staffId: string) => {
    if (!isAdmin) return;
    const nextStaff = staff.map((member) => (member.id === staffId ? { ...member, activeTo: currentMonthEndKey } : member));
    setStaff(nextStaff);
    await persistData(nextStaff, assignments);
  };
  const moveStaff = async (staffId: string, direction: -1 | 1) => {
    if (!isAdmin) return;
    const visibleIds = monthVisibleStaff.map((member) => member.id);
    const fromVisibleIndex = visibleIds.indexOf(staffId);
    const toVisibleIndex = fromVisibleIndex + direction;
    if (fromVisibleIndex < 0 || toVisibleIndex < 0 || toVisibleIndex >= visibleIds.length) return;
    const fromIndex = staff.findIndex((member) => member.id === visibleIds[fromVisibleIndex]);
    const toIndex = staff.findIndex((member) => member.id === visibleIds[toVisibleIndex]);
    if (fromIndex < 0 || toIndex < 0) return;
    const nextStaff = [...staff];
    const [moved] = nextStaff.splice(fromIndex, 1);
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    nextStaff.splice(insertIndex, 0, moved);
    setStaff(nextStaff);
    await persistData(nextStaff, assignments);
  };
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    });
    if (!response.ok) {
      setLoginError("ログイン情報が正しくありません");
      return;
    }
    const authPayload = (await response.json()) as { user: AuthUser };
    setUser(authPayload.user);
    setLoginPassword("");
    const shiftRes = await fetch("/api/shifts", { cache: "no-store" });
    if (!shiftRes.ok) {
      setLoginError("シフト情報の取得に失敗しました");
      return;
    }
    const shiftPayload = (await shiftRes.json()) as { staff: StaffMember[]; assignments: ShiftAssignmentMap };
    setStaff(shiftPayload.staff);
    setAssignments(normalizeAssignments(shiftPayload.assignments));
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    const reset = createInitialData(new Date(2026, 2, 1));
    setStaff(reset.staff);
    setAssignments(reset.assignments);
  };
  const handleCsvFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseShiftCsv(text);
    setCsvImportErrors(parsed.errors);
    setCsvImportPreview(parsed.preview);
  };
  const applyCsvImport = async () => {
    if (!csvImportPreview) return;
    setStaff(csvImportPreview.staff);
    setAssignments(csvImportPreview.assignments);
    const firstDate = csvImportPreview.parsedDates[0];
    if (firstDate) {
      const [year, month] = firstDate.split("-").map(Number);
      if (year && month) setCurrentMonth(new Date(year, month - 1, 1));
    }
    await persistData(csvImportPreview.staff, csvImportPreview.assignments);
    setCsvImportOpen(false);
    setCsvImportErrors([]);
    setCsvImportPreview(null);
  };

  return {
    authLoading,
    user,
    isAdmin,
    inputMode,
    currentMonth,
    monthPickerOpen,
    saveStatus,
    warnings,
    todayKey,
    todayWorkingCount,
    todayTargetHeadcount,
    mobileTodayPresent,
    mobileTodayAbsent,
    monthlyTotals,
    showMonthlySummaryMobile,
    tableRangeMode,
    targetWeekday,
    targetWeekend,
    targetHoliday,
    showTableOptions,
    holidayDatesInput,
    visibleMonthDays,
    monthVisibleStaff,
    assignments,
    totalsByStaff,
    totalsByDate,
    workingCountByDate,
    targetByDate,
    staffingBalanceSummary,
    previewSortMode,
    viewMode,
    showRegularOffInMonth,
    monthCells,
    weekDays,
    weekFocusDate,
    calendarEditor,
    selectedDateDetail,
    csvImportOpen,
    csvImportErrors,
    csvImportPreview,
    addStaffModalOpen,
    newStaffName,
    miniCalendarCells,
    setLoginUsername,
    loginUsername,
    setLoginPassword,
    loginPassword,
    loginError,
    handleLogin,
    handleLogout,
    setMonthPickerOpen,
    setInputMode,
    moveMonth,
    setCurrentMonth,
    getShiftType,
    setShowMonthlySummaryMobile,
    setTableRangeMode,
    setTargetWeekday,
    setTargetWeekend,
    setTargetHoliday,
    setShowTableOptions,
    setHolidayDatesInput,
    setAddStaffModalOpen,
    setCsvImportOpen,
    selectableShiftTypes,
    updateAssignment,
    moveStaff,
    removeStaff,
    setPreviewSortMode,
    setViewMode,
    setShowRegularOffInMonth,
    setWeekFocusDate,
    moveWeek,
    setWeekToToday,
    getPreviewStaffByDate,
    openCalendarEditor,
    setSelectedDateDetail,
    setCalendarEditor,
    applyCalendarEditor,
    detailStaffByDate,
    setCsvImportErrors,
    setCsvImportPreview,
    handleCsvFileSelected,
    applyCsvImport,
    setNewStaffName,
    submitAddStaff,
  };
}
