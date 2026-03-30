"use client";

import type { CsvImportModalProps } from "@/app/components/home/modals/types";

export function CsvImportModal({
  visible,
  setVisible,
  csvImportErrors,
  setCsvImportErrors,
  csvImportPreview,
  setCsvImportPreview,
  handleCsvFileSelected,
  applyCsvImport,
}: CsvImportModalProps) {
  if (!visible) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">CSVインポート（完全置換）</h3>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
            onClick={() => {
              setVisible(false);
              setCsvImportErrors([]);
              setCsvImportPreview(null);
            }}
          >
            閉じる
          </button>
        </div>
        <p className="text-xs text-slate-500">形式: 1列目スタッフ名、2列目以降にYYYY-MM-DDの日付列</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block w-full text-sm"
          onChange={(event) => void handleCsvFileSelected(event)}
        />
        {csvImportErrors.length > 0 && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-semibold text-rose-700">エラー</p>
            <ul className="mt-1 max-h-40 list-disc space-y-1 overflow-auto pl-4 text-xs text-rose-700">
              {csvImportErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {csvImportPreview && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p>スタッフ数: {csvImportPreview.staff.length}</p>
            <p>日付列数: {csvImportPreview.parsedDates.length}</p>
            <p className="mt-1">
              先頭日: {csvImportPreview.parsedDates[0]} / 末尾日:{" "}
              {csvImportPreview.parsedDates[csvImportPreview.parsedDates.length - 1]}
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-300"
            onClick={() => {
              setVisible(false);
              setCsvImportErrors([]);
              setCsvImportPreview(null);
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={!csvImportPreview || csvImportErrors.length > 0}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
            onClick={() => void applyCsvImport()}
          >
            インポート実行
          </button>
        </div>
      </div>
    </div>
  );
}
