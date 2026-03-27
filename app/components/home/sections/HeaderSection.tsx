"use client";

import { getMonthLabel } from "@/app/utils/schedule";
import type { HeaderSectionProps } from "@/app/components/home/sections/types";

const MINI_WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function HeaderSection(props: HeaderSectionProps) {
  const {
    isAdmin,
    user,
    handleLogout,
    monthPickerOpen,
    setMonthPickerOpen,
    currentMonth,
    saveStatus,
    inputMode,
    setInputMode,
    moveMonth,
    miniCalendarCells,
    setCurrentMonth,
  } = props;
  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur md:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Shift Planner</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">シフト作成・閲覧アプリ</h1>
      <p className="mt-1 text-sm text-slate-600">
        {isAdmin
          ? "管理者でログイン中です。シフトを編集できます。"
          : "一般スタッフでログイン中です。希望休・有給のみ入力できます。"}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
          ログイン: {user.username} ({isAdmin ? "管理者" : "一般スタッフ"})
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl bg-slate-700 px-3 py-2 text-sm text-white transition hover:bg-slate-600"
        >
          ログアウト
        </button>
        <button
          type="button"
          onClick={() => setMonthPickerOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>{getMonthLabel(currentMonth)}</span>
          <span className="text-xs text-slate-400">▼</span>
        </button>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
          保存状態: {saveStatus === "saving" ? "保存中..." : saveStatus === "error" ? "保存失敗" : "正常"}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              inputMode === "table" ? "bg-indigo-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setInputMode("table")}
          >
            表入力
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              inputMode === "calendar"
                ? "bg-indigo-500 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setInputMode("calendar")}
          >
            カレンダー入力
          </button>
        </div>
      </div>
      {monthPickerOpen && (
        <div className="mt-3 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
              onClick={() => moveMonth(-1)}
            >
              ←
            </button>
            <p className="text-sm font-semibold text-slate-700">{getMonthLabel(currentMonth)}</p>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
              onClick={() => moveMonth(1)}
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {MINI_WEEKDAY_LABELS.map((weekday) => (
              <div
                key={`mini-weekday-${weekday}`}
                className="py-1 text-center text-sm font-medium text-slate-500"
              >
                {weekday}
              </div>
            ))}
            {miniCalendarCells.map((cell) => {
              const today = new Date();
              const isToday =
                today.getFullYear() === cell.date.getFullYear() &&
                today.getMonth() === cell.date.getMonth() &&
                today.getDate() === cell.date.getDate();
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`h-9 rounded-full text-sm transition ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : cell.inCurrentMonth
                        ? "text-slate-800 hover:bg-slate-100"
                        : "text-slate-400 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    setCurrentMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    setMonthPickerOpen(false);
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
