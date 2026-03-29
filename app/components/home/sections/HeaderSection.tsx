"use client";

import { useEffect, useState } from "react";
import { getMonthLabel } from "@/app/utils/schedule";
import type { StaffJobFilter } from "@/app/types";
import type { HeaderSectionProps } from "@/app/components/home/sections/types";

const MINI_WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function HamburgerIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl font-light leading-none text-slate-700 shadow-sm">
        ×
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm">
      <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
      <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
      <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
    </span>
  );
}

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
    showInputModeToggle = true,
    staffJobFilter,
    setStaffJobFilter,
    staffJobFilterOptions,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const menuContent = (
    <>
      <h1 className="text-lg font-bold text-slate-900">シフト作成・閲覧アプリ</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isAdmin
          ? "管理者でログイン中です。シフトを編集できます。"
          : "一般スタッフでログイン中です。希望休・有給のみ入力できます。"}
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800">
          <span className="text-xs text-slate-500">表示する職種</span>
          <select
            value={staffJobFilter}
            onChange={(event) => setStaffJobFilter(event.target.value as StaffJobFilter)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none ring-indigo-100 focus:ring"
          >
            {staffJobFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800">
          ログイン: {user.username}（{isAdmin ? "管理者" : "一般スタッフ"}）
        </div>
        <button
          type="button"
          onClick={() => {
            void handleLogout();
            closeMenu();
          }}
          className="rounded-xl bg-slate-700 px-3 py-3 text-sm font-medium text-white transition hover:bg-slate-600"
        >
          ログアウト
        </button>
        <button
          type="button"
          onClick={() => setMonthPickerOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>{getMonthLabel(currentMonth)}</span>
          <span className="text-xs text-slate-400">▼</span>
        </button>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          保存状態: {saveStatus === "saving" ? "保存中…" : saveStatus === "error" ? "保存失敗" : "正常"}
        </div>
        {showInputModeToggle ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                inputMode === "table" ? "bg-indigo-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setInputMode("table")}
            >
              表入力
            </button>
            <button
              type="button"
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                inputMode === "calendar"
                  ? "bg-indigo-500 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setInputMode("calendar")}
            >
              カレンダー入力
            </button>
          </div>
        ) : null}
      </div>
      {monthPickerOpen && (
        <div className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
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
    </>
  );

  return (
    <>
      {/* SP: 最小ヘッダー + メニュー */}
      <header className="sticky top-0 z-30 -mx-4 mb-1 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">SHIFT PLANNER</p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl py-1 pl-2 pr-1 text-slate-700 transition active:bg-slate-100"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          <span className="text-sm font-medium text-slate-700">メニュー</span>
          <HamburgerIcon open={menuOpen} />
        </button>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="アプリメニュー">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeMenu}
            aria-label="閉じる"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-slate-200/90 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">SHIFT PLANNER</p>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                onClick={closeMenu}
                aria-label="閉じる"
              >
                <span className="block text-lg leading-none">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{menuContent}</div>
          </div>
        </div>
      ) : null}

      {/* PC: 従来レイアウト */}
      <section className="hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur md:block md:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Shift Planner</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">シフト作成・閲覧アプリ</h1>
        <p className="mt-1 text-sm text-slate-600">
          {isAdmin
            ? "管理者でログイン中です。シフトを編集できます。"
            : "一般スタッフでログイン中です。希望休・有給のみ入力できます。"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <span className="text-[11px] font-medium text-slate-500">表示する職種</span>
            <select
              value={staffJobFilter}
              onChange={(event) => setStaffJobFilter(event.target.value as StaffJobFilter)}
              className="min-w-[9rem] rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 outline-none ring-indigo-100 focus:ring"
            >
              {staffJobFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
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
          {showInputModeToggle ? (
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
          ) : null}
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
                  key={`mini-weekday-d-${weekday}`}
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
                    key={`d-${cell.key}`}
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
    </>
  );
}
