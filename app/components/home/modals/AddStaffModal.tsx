"use client";

import type { StaffJobTypeRecord } from "@/app/types";
import type { AddStaffModalProps } from "@/app/components/home/modals/types";

export function AddStaffModal({
  visible,
  setVisible,
  newStaffName,
  setNewStaffName,
  newStaffJobTypeId,
  setNewStaffJobTypeId,
  counselorJobTypeId,
  jobTypes,
  submitAddStaff,
}: AddStaffModalProps) {
  if (!visible) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-900">スタッフを追加</h3>
        <p className="mt-1 text-xs text-slate-500">追加したスタッフは全日「出勤」で初期登録されます。</p>
        <label className="mt-4 block text-sm text-slate-700">
          スタッフ名
          <input
            type="text"
            value={newStaffName}
            onChange={(event) => setNewStaffName(event.target.value)}
            placeholder="例: 山田"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-100 focus:ring"
            autoFocus
          />
        </label>
        <label className="mt-3 block text-sm text-slate-700">
          職種
          <select
            value={newStaffJobTypeId}
            onChange={(event) => setNewStaffJobTypeId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-100 focus:ring"
          >
            {jobTypes.map((job: StaffJobTypeRecord) => (
              <option key={job.id} value={job.id}>
                {job.label}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-300"
            onClick={() => {
              setVisible(false);
              setNewStaffName("");
              setNewStaffJobTypeId(counselorJobTypeId);
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            onClick={() => void submitAddStaff()}
            disabled={!newStaffName.trim()}
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  );
}
