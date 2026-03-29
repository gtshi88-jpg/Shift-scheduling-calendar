"use client";

import type { ShiftCode } from "@/app/types";
import type { TableInputSectionProps } from "@/app/components/home/sections/types";

export function TableInputSection(props: TableInputSectionProps) {
  if (props.inputMode !== "table") {
    return null;
  }
  const {
    tableRangeMode,
    setTableRangeMode,
    targetWeekday,
    setTargetWeekday,
    targetWeekend,
    setTargetWeekend,
    targetHoliday,
    setTargetHoliday,
    showTableOptions,
    setShowTableOptions,
    holidayDatesInput,
    setHolidayDatesInput,
    isAdmin,
    setAddStaffModalOpen,
    setCsvImportOpen,
    visibleMonthDays,
    monthVisibleStaff,
    assignments,
    user,
    getShiftType,
    selectableShiftTypes,
    shiftShortLabel,
    updateAssignment,
    memberMonthLocked,
    totalsByStaff,
    totalsByDate,
    monthDaysInMonth,
    workingCountByDate,
    targetByDate,
    staffingBalanceSummary,
    moveStaff,
    removeStaff,
  } = props;

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur sm:p-4 md:p-6">
      <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
        <div className="min-w-0 shrink-0">
          <h2 className="text-lg font-semibold">表形式入力</h2>
          <p className="text-xs text-slate-500">横スクロールを減らすため表示範囲を切り替えできます</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              tableRangeMode === "firstHalf" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setTableRangeMode("firstHalf")}
          >
            1-16日
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              tableRangeMode === "secondHalf" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setTableRangeMode("secondHalf")}
          >
            17-31日
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              tableRangeMode === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setTableRangeMode("all")}
          >
            全表示
          </button>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          平日目標
          <input
            type="number"
            min={0}
            value={targetWeekday}
            onChange={(event) => setTargetWeekday(Math.max(0, Number(event.target.value || 0)))}
            className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-right outline-none ring-indigo-100 focus:ring"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          土日目標
          <input
            type="number"
            min={0}
            value={targetWeekend}
            onChange={(event) => setTargetWeekend(Math.max(0, Number(event.target.value || 0)))}
            className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-right outline-none ring-indigo-100 focus:ring"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          祝日目標
          <input
            type="number"
            min={0}
            value={targetHoliday}
            onChange={(event) => setTargetHoliday(Math.max(0, Number(event.target.value || 0)))}
            className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-right outline-none ring-indigo-100 focus:ring"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          title="オプション"
          onClick={() => setShowTableOptions((prev) => !prev)}
        >
          ⚙
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setAddStaffModalOpen(true)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700"
          >
            スタッフ追加
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCsvImportOpen(true)}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-500"
          >
            CSVインポート
          </button>
        )}
      </div>
      {showTableOptions && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            祝日(YYYY-MM-DD,区切り)
            <input
              type="text"
              value={holidayDatesInput}
              onChange={(event) => setHolidayDatesInput(event.target.value)}
              placeholder="2026-03-20,2026-03-21"
              className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none ring-indigo-100 focus:ring"
            />
          </label>
        </div>
      )}
      <div className="-mx-1 overflow-x-auto overflow-y-visible rounded-2xl border border-slate-200 shadow-inner sm:mx-0">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-10 min-w-[7.5rem] border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-left sm:min-w-40 sm:px-3">
                スタッフ
              </th>
              {visibleMonthDays.map((day) => (
                <th
                  key={day.key}
                  className="min-w-12 border-b border-r border-slate-200 px-0.5 py-2 text-center sm:min-w-14 sm:px-1"
                >
                  <div className={day.isWeekend ? "text-xs text-rose-600" : "text-xs"}>{day.day}</div>
                  <div className="text-[10px] text-slate-400">{day.weekday}</div>
                </th>
              ))}
              <th className="min-w-[11rem] border-b border-slate-200 px-2 py-2 text-center text-xs text-slate-600 sm:min-w-[12.5rem]">
                <div>合計（出 / 欠 / 有 / 希 / 公休）</div>
                <div className="mt-0.5 text-[10px] font-normal text-slate-400">全{monthDaysInMonth}日分</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {monthVisibleStaff.map((member, index) => (
              <tr key={member.id}>
                <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-2 py-2 align-middle sm:px-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 disabled:opacity-40"
                            disabled={index === 0}
                            onClick={() => void moveStaff(member.id, -1)}
                            title="上へ移動"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 disabled:opacity-40"
                            disabled={index === monthVisibleStaff.length - 1}
                            onClick={() => void moveStaff(member.id, 1)}
                            title="下へ移動"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="rounded bg-rose-100 px-2 py-1 text-xs text-rose-700"
                        onClick={() => void removeStaff(member.id)}
                      >
                        退職
                      </button>
                    )}
                  </div>
                </td>
                {visibleMonthDays.map((day) => {
                  const selected = assignments[day.key]?.[member.id] ?? "WORK";
                  const selectedShift = getShiftType(selected);
                  return (
                    <td key={`${member.id}-${day.key}`} className="border-b border-r border-slate-200 p-1">
                      <select
                        disabled={!user || (!isAdmin && memberMonthLocked)}
                        value={selected}
                        className="min-h-11 w-full max-w-[5.5rem] rounded-lg border border-slate-200 px-1 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:bg-slate-100 sm:max-w-none"
                        style={{ backgroundColor: selectedShift.color }}
                        onChange={(event) =>
                          updateAssignment(day.key, member.id, event.target.value as ShiftCode)
                        }
                      >
                        {selectableShiftTypes(selected).map((type) => (
                          <option key={type.code} value={type.code}>
                            {shiftShortLabel[type.code]} ({type.label})
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
                <td className="border-b border-slate-200 px-2 py-1 text-center text-xs text-slate-700">
                  <span className="font-semibold">{totalsByStaff[member.id]?.work ?? 0}</span> /{" "}
                  <span className="font-semibold text-rose-700">{totalsByStaff[member.id]?.absent ?? 0}</span>{" "}
                  /{" "}
                  <span className="font-semibold text-amber-700">
                    {totalsByStaff[member.id]?.paidLeave ?? 0}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold text-fuchsia-700">
                    {totalsByStaff[member.id]?.requestOff ?? 0}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold text-red-600">
                    {totalsByStaff[member.id]?.regularOff ?? 0}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                日別人数（出 / 欠 / 有 / 希 / 公休）
              </td>
              {visibleMonthDays.map((day) => (
                <td
                  key={`daily-total-${day.key}`}
                  className="border-b border-r border-slate-200 px-1 py-2 text-center text-[11px]"
                >
                  <span className="font-semibold text-slate-800">{totalsByDate[day.key]?.work ?? 0}</span> /{" "}
                  <span className="font-semibold text-rose-700">{totalsByDate[day.key]?.absent ?? 0}</span>{" "}
                  /{" "}
                  <span className="font-semibold text-amber-700">{totalsByDate[day.key]?.paidLeave ?? 0}</span>{" "}
                  /{" "}
                  <span className="font-semibold text-fuchsia-700">
                    {totalsByDate[day.key]?.requestOff ?? 0}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold text-red-600">{totalsByDate[day.key]?.regularOff ?? 0}</span>
                </td>
              ))}
              <td className="border-b border-slate-200 px-2 py-2 text-center text-[11px] text-slate-500">
                計{monthDaysInMonth}日
              </td>
            </tr>
            <tr className="bg-indigo-50/50">
              <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-indigo-50/60 px-3 py-2 text-xs font-semibold text-indigo-900">
                稼働差分（平日{targetWeekday} / 土日{targetWeekend} / 祝日{targetHoliday}）
              </td>
              {visibleMonthDays.map((day) => {
                const working = workingCountByDate[day.key] ?? 0;
                const target = targetByDate[day.key] ?? 0;
                const diff = working - target;
                const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;
                const toneClass =
                  diff < 0 ? "bg-rose-100/80" : diff > 0 ? "bg-emerald-100/80" : "bg-slate-100/70";
                return (
                  <td
                    key={`diff-${day.key}`}
                    className={`border-b border-r border-slate-200 px-1 py-2 text-center text-[11px] ${toneClass}`}
                  >
                    <span className="font-semibold text-slate-700">{working}</span>
                    <span className="ml-1 text-[10px] text-slate-500">/{target}</span>
                    <span
                      className={`ml-1 font-semibold ${
                        diff < 0 ? "text-rose-700" : diff > 0 ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      ({diffLabel})
                    </span>
                  </td>
                );
              })}
              <td className="border-b border-slate-200 px-2 py-2 text-center text-[11px] text-indigo-700">
                稼働人数 / 差分
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">
          不足日 {staffingBalanceSummary.shortageDays}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
          過多日 {staffingBalanceSummary.surplusDays}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          一致日 {staffingBalanceSummary.exactDays}
        </span>
        <span className="text-slate-500">色: 赤=不足 / 緑=過多 / 灰=一致</span>
      </div>
    </section>
  );
}
