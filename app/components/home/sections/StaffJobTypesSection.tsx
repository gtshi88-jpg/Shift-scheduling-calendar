"use client";

import { useState } from "react";
import type { StaffJobTypeRecord } from "@/app/types";

export type StaffJobTypesSectionProps = {
  isAdmin: boolean;
  jobTypes: StaffJobTypeRecord[];
  createJobType: (label: string) => Promise<boolean>;
  updateJobTypeLabel: (id: string, label: string) => Promise<boolean>;
  deleteJobType: (id: string) => Promise<{ ok: boolean; message?: string }>;
};

export function StaffJobTypesSection({
  isAdmin,
  jobTypes,
  createJobType,
  updateJobTypeLabel,
  deleteJobType,
}: StaffJobTypesSectionProps) {
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  if (!isAdmin) {
    return null;
  }

  const handleCreate = async () => {
    const label = newLabel.trim();
    if (!label) {
      return;
    }
    setBusy(true);
    setNotice("");
    const ok = await createJobType(label);
    setBusy(false);
    if (ok) {
      setNewLabel("");
      setNotice("職種を追加しました。");
    } else {
      setNotice("追加に失敗しました。名称を確認するか、しばらくしてから再度お試しください。");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`職種「${label}」を削除しますか？`)) {
      return;
    }
    setBusy(true);
    setNotice("");
    const result = await deleteJobType(id);
    setBusy(false);
    if (result.ok) {
      setNotice("削除しました。");
    } else {
      setNotice(result.message ?? "削除できませんでした。");
    }
  };

  const startEdit = (job: StaffJobTypeRecord) => {
    setEditingId(job.id);
    setEditLabel(job.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const saveEdit = async () => {
    if (!editingId) {
      return;
    }
    const label = editLabel.trim();
    if (!label) {
      return;
    }
    setBusy(true);
    setNotice("");
    const ok = await updateJobTypeLabel(editingId, label);
    setBusy(false);
    if (ok) {
      cancelEdit();
      setNotice("表示名を更新しました。");
    } else {
      setNotice("更新に失敗しました。");
    }
  };

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">職種マスタ</h2>
      <p className="mt-1 text-xs text-slate-500">
        シフト表の列フィルタやスタッフの所属に使います。不要な職種は、スタッフが誰も紐づいていないときだけ削除できます。
      </p>
      {notice ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{notice}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-sm text-slate-700">
          新しい職種の表示名
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="例: 受付"
            disabled={busy}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-100 focus:ring disabled:opacity-60"
          />
        </label>
        <button
          type="button"
          disabled={busy || !newLabel.trim()}
          onClick={() => void handleCreate()}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          追加
        </button>
      </div>
      <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/80">
        {jobTypes.map((job) => (
          <li key={job.id} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            {editingId === job.id ? (
              <>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  disabled={busy}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={busy || !editLabel.trim()}
                    onClick={() => void saveEdit()}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    取消
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{job.label}</p>
                  <p className="font-mono text-[11px] text-slate-400">code: {job.code}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEdit(job)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    名前を編集
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete(job.id, job.label)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
