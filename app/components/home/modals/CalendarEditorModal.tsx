"use client";

import type { ShiftCode } from "@/app/types";
import type { CalendarEditorModalProps } from "@/app/components/home/modals/types";

export function CalendarEditorModal(props: CalendarEditorModalProps) {
  const {
    visible,
    calendarEditor,
    setCalendarEditor,
    getPreviewStaffByDate,
    assignments,
    selectableShiftTypes,
    applyCalendarEditor,
  } = props;
  if (!visible || !calendarEditor) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-4 shadow-2xl">
        <p className="text-sm font-semibold text-indigo-800">{calendarEditor.dateKey} のシフト編集</p>
        <div className="mt-3 flex flex-col gap-3">
          <label className="text-sm text-slate-700">
            スタッフ
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              value={calendarEditor.staffId}
              onChange={(event) => {
                const staffId = event.target.value;
                const code = assignments[calendarEditor.dateKey]?.[staffId] ?? "WORK";
                setCalendarEditor({
                  ...calendarEditor,
                  staffId,
                  code,
                });
              }}
            >
              {getPreviewStaffByDate(calendarEditor.dateKey).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            勤務区分
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              value={calendarEditor.code}
              onChange={(event) =>
                setCalendarEditor({
                  ...calendarEditor,
                  code: event.target.value as ShiftCode,
                })
              }
            >
              {selectableShiftTypes(calendarEditor.code).map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-300"
              onClick={() => setCalendarEditor(null)}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-500"
              onClick={applyCalendarEditor}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
