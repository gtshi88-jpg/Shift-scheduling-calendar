"use client";

type StaffConfirmModalProps = {
  visible: boolean;
  variant: "retire" | "delete";
  staffName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function StaffConfirmModal({
  visible,
  variant,
  staffName,
  busy,
  onCancel,
  onConfirm,
}: StaffConfirmModalProps) {
  if (!visible) {
    return null;
  }

  const title = variant === "retire" ? "退職の確認" : "スタッフの削除";
  const body =
    variant === "retire" ? (
      <p className="text-sm text-slate-700">
        <span className="font-medium text-slate-900">{staffName}</span>
        <br />
        退職をすると来月のシフト表から名前が表示されなくなります。
        <span className="mt-2 block text-xs text-slate-500">
          ※今月の表には、退職日（当月末）までは表示されます。
        </span>
        <span className="mt-3 block font-medium text-slate-900">退職しますか？</span>
      </p>
    ) : (
      <p className="text-sm text-slate-700">
        <span className="font-medium text-slate-900">{staffName}</span>
        を一覧から<span className="font-medium text-rose-700">完全に削除</span>
        します。登録されているシフトデータも失われ、この操作は取り消せません。
        <br />
        削除しますか？
      </p>
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="閉じる"
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-confirm-title"
      >
        <h3 id="staff-confirm-title" className="text-base font-semibold text-slate-900">
          {title}
        </h3>
        <div className="mt-3">{body}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCancel}
            disabled={busy}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={
              variant === "retire"
                ? "rounded-lg bg-rose-600 px-3 py-2 text-sm text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                : "rounded-lg bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            }
            onClick={() => void onConfirm()}
            disabled={busy}
          >
            {busy ? "処理中…" : variant === "retire" ? "退職する" : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
