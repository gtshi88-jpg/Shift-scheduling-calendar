"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ShiftCode, ShiftType, StaffJobTypeRecord, StaffMember } from "@/app/types";

export type CsvImportPreview = {
  staff: StaffMember[];
  assignments: Record<string, Record<string, ShiftCode>>;
  parsedDates: string[];
};

export type CalendarEditorState = {
  dateKey: string;
  staffId: string;
  code: ShiftCode;
};

export type DateDetailItem = {
  member: StaffMember;
  code: ShiftCode;
  shiftType: ShiftType;
};

export type CalendarEditorModalProps = {
  visible: boolean;
  calendarEditor: CalendarEditorState | null;
  setCalendarEditor: Dispatch<SetStateAction<CalendarEditorState | null>>;
  getPreviewStaffByDate: (dateKey: string) => StaffMember[];
  assignments: Record<string, Record<string, ShiftCode>>;
  selectableShiftTypes: (currentCode?: ShiftCode) => ShiftType[];
  applyCalendarEditor: () => void;
};

export type DateDetailModalProps = {
  selectedDateDetail: string | null;
  setSelectedDateDetail: Dispatch<SetStateAction<string | null>>;
  detailStaffByDate: (dateKey: string) => DateDetailItem[];
};

export type CsvImportModalProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  csvImportErrors: string[];
  setCsvImportErrors: Dispatch<SetStateAction<string[]>>;
  csvImportPreview: CsvImportPreview | null;
  setCsvImportPreview: Dispatch<SetStateAction<CsvImportPreview | null>>;
  handleCsvFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  applyCsvImport: () => Promise<void>;
};

export type AddStaffModalProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  newStaffName: string;
  setNewStaffName: Dispatch<SetStateAction<string>>;
  newStaffJobTypeId: string;
  setNewStaffJobTypeId: Dispatch<SetStateAction<string>>;
  counselorJobTypeId: string;
  jobTypes: StaffJobTypeRecord[];
  submitAddStaff: () => Promise<void>;
  addStaffSubmitting: boolean;
};
