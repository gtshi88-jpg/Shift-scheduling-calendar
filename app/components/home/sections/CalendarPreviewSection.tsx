"use client";

import { getMonthLabel } from "@/app/utils/schedule";
import type { CalendarPreviewSectionProps, PreviewSortMode } from "@/app/components/home/sections/types";

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

export function CalendarPreviewSection(props: CalendarPreviewSectionProps) {
  const {
    currentMonth,
    previewSortMode,
    setPreviewSortMode,
    viewMode,
    setViewMode,
    showRegularOffInMonth,
    setShowRegularOffInMonth,
    monthCells,
    weekDays,
    weekFocusDate,
    setWeekFocusDate,
    moveWeek,
    setWeekToToday,
    getPreviewStaffByDate,
    assignments,
    getShiftType,
    user,
    inputMode,
    openCalendarEditor,
    setSelectedDateDetail,
    calendarEditingLocked,
    onPrint,
    readOnly = false,
  } = props;

  const canEditCalendar = Boolean(
    user && inputMode === "calendar" && !calendarEditingLocked && !readOnly,
  );

  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">カレンダープレビュー</h2>
          <p className="text-sm text-slate-500">
            {readOnly
              ? "表示は閲覧のみです"
              : "Googleカレンダー風のレイアウトで表示"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 print:hidden"
          >
            印刷 / PDF
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
            並び順
            <select
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
              value={previewSortMode}
              onChange={(event) => setPreviewSortMode(event.target.value as PreviewSortMode)}
            >
              <option value="presentFirst">出勤者優先</option>
              <option value="createdOrder">作成順</option>
              <option value="name">名前順</option>
            </select>
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                viewMode === "month" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setViewMode("month")}
            >
              月
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                viewMode === "week" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setViewMode("week")}
            >
              週
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">{getMonthLabel(currentMonth)}</p>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={showRegularOffInMonth}
                onChange={(event) => setShowRegularOffInMonth(event.target.checked)}
              />
              公休も表示
            </label>
          </div>
          <div className="grid grid-cols-7 gap-1 md:hidden">
            {WEEKDAY_LABELS.map((weekday) => (
              <div
                key={weekday}
                className={`rounded-lg py-1 text-center text-xs font-semibold ${
                  weekday === "土"
                    ? "bg-primary-muted text-primary"
                    : weekday === "日"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {weekday}
              </div>
            ))}
            {monthCells.map((cell) => (
              <div
                key={cell.key}
                className={`relative min-h-28 touch-manipulation rounded-xl border p-2 transition ${
                  cell.inMonth
                    ? "border-slate-200 bg-white shadow-sm"
                    : "border-slate-100 bg-slate-50/40 opacity-60"
                }`}
              >
                {!canEditCalendar ? (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 rounded-xl"
                    aria-label={`${cell.day}日の詳細を表示`}
                    onClick={() => setSelectedDateDetail(cell.key)}
                  />
                ) : null}
                <div className={!canEditCalendar ? "relative z-20 pointer-events-none" : "relative z-20"}>
                  {canEditCalendar ? (
                    <button
                      type="button"
                      className={`min-h-11 w-full rounded-lg px-1 text-left text-xs touch-manipulation ${
                        cell.isWeekend ? "text-rose-600" : "text-slate-500"
                      }`}
                      onClick={() => setSelectedDateDetail(cell.key)}
                    >
                      {cell.day}
                    </button>
                  ) : (
                    <span
                      className={`block min-h-[2.75rem] text-xs leading-8 ${
                        cell.isWeekend ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {cell.day}
                    </span>
                  )}
                  <div className="mt-1 space-y-1">
                    {(() => {
                      const events = getPreviewStaffByDate(cell.key)
                        .map((member) => {
                          const shiftCode = assignments[cell.key]?.[member.id] ?? "WORK";
                          if (shiftCode === "REGULAR_OFF" && !showRegularOffInMonth) {
                            return null;
                          }
                          return { member, shiftType: getShiftType(shiftCode) };
                        })
                        .filter((item) => item !== null);
                      const visible = events.slice(0, 3);
                      const hiddenCount = Math.max(0, events.length - visible.length);
                      return (
                        <>
                          {visible.map((event) =>
                            canEditCalendar ? (
                              <button
                                type="button"
                                key={`${cell.key}-${event.member.id}`}
                                className="pointer-events-auto w-full truncate rounded px-1 py-0.5 text-left text-[10px] hover:brightness-95"
                                style={{ backgroundColor: event.shiftType.color }}
                                title={`${event.member.name} ${event.shiftType.label}`}
                                onClick={() => openCalendarEditor(cell.key, event.member.id)}
                              >
                                {event.member.name} {event.shiftType.label}
                              </button>
                            ) : (
                              <div
                                key={`${cell.key}-${event.member.id}`}
                                className="w-full truncate rounded px-1 py-0.5 text-left text-[10px]"
                                style={{ backgroundColor: event.shiftType.color }}
                                title={`${event.member.name} ${event.shiftType.label}`}
                              >
                                {event.member.name} {event.shiftType.label}
                              </div>
                            ),
                          )}
                          {hiddenCount > 0 && <div className="text-[10px] text-slate-500">+{hiddenCount}件</div>}
                        </>
                      );
                    })()}
                  </div>
                  {canEditCalendar && (
                    <button
                      type="button"
                      className="pointer-events-auto mt-1 min-h-11 w-full rounded border border-dashed border-slate-300 px-1 py-1.5 text-[10px] text-slate-500 touch-manipulation"
                      onClick={() => openCalendarEditor(cell.key)}
                    >
                      + 編集
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden grid-cols-7 gap-1 md:grid">
            {WEEKDAY_LABELS.map((weekday) => (
              <div
                key={weekday}
                className={`rounded-lg py-2 text-center text-sm font-semibold ${
                  weekday === "土"
                    ? "bg-primary-muted text-primary"
                    : weekday === "日"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {weekday}
              </div>
            ))}
            {monthCells.map((cell) => (
              <div
                key={cell.key}
                className={`relative min-h-28 touch-manipulation rounded-xl border p-2 transition ${
                  cell.inMonth
                    ? "border-slate-200 bg-white shadow-sm"
                    : "border-slate-100 bg-slate-50/40 opacity-70"
                }`}
              >
                {!canEditCalendar ? (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 rounded-xl"
                    aria-label={`${cell.day}日の詳細を表示`}
                    onClick={() => setSelectedDateDetail(cell.key)}
                  />
                ) : null}
                <div className={!canEditCalendar ? "relative z-20 pointer-events-none" : "relative z-20"}>
                  {canEditCalendar ? (
                    <button
                      type="button"
                      className={`min-h-11 w-full rounded-lg px-1 text-left text-xs touch-manipulation ${
                        cell.isWeekend ? "text-rose-600" : "text-slate-500"
                      }`}
                      onClick={() => setSelectedDateDetail(cell.key)}
                    >
                      {cell.day}
                    </button>
                  ) : (
                    <span
                      className={`block min-h-[2.75rem] text-xs leading-8 ${
                        cell.isWeekend ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {cell.day}
                    </span>
                  )}
                  <div className="mt-1 grid grid-cols-1 gap-1 xl:grid-cols-2">
                    {getPreviewStaffByDate(cell.key).map((member) => {
                      const shiftCode = assignments[cell.key]?.[member.id] ?? "WORK";
                      const shiftType = getShiftType(shiftCode);
                      if (shiftCode === "REGULAR_OFF" && !showRegularOffInMonth) {
                        return null;
                      }
                      return canEditCalendar ? (
                        <button
                          type="button"
                          key={`${cell.key}-${member.id}`}
                          className="pointer-events-auto min-w-0 truncate rounded-md px-1 py-0.5 text-left text-xs shadow-sm hover:brightness-95"
                          style={{ backgroundColor: shiftType.color }}
                          title={`${member.name} ${shiftType.label}`}
                          onClick={() => openCalendarEditor(cell.key, member.id)}
                        >
                          {member.name} {shiftType.label}
                        </button>
                      ) : (
                        <div
                          key={`${cell.key}-${member.id}`}
                          className="min-w-0 truncate rounded-md px-1 py-0.5 text-left text-xs shadow-sm"
                          style={{ backgroundColor: shiftType.color }}
                          title={`${member.name} ${shiftType.label}`}
                        >
                          {member.name} {shiftType.label}
                        </div>
                      );
                    })}
                  </div>
                  {canEditCalendar && (
                    <button
                      type="button"
                      className="pointer-events-auto mt-2 min-h-11 w-full rounded-md border border-dashed border-slate-300 px-2 py-2 text-xs text-slate-500 transition hover:border-primary-subtle hover:text-primary touch-manipulation"
                      onClick={() => openCalendarEditor(cell.key)}
                    >
                      + 追加 / 編集
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {viewMode === "week" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={setWeekToToday}
              >
                Today
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => moveWeek(-7)}
                aria-label="前の週"
              >
                &lt;
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => moveWeek(7)}
                aria-label="次の週"
              >
                &gt;
              </button>
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {weekDays[0]
                ? `${weekDays[0].month}/${weekDays[0].day} - ${weekDays[6].month}/${weekDays[6].day}`
                : ""}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              週の基準日
              <input
                type="date"
                value={weekFocusDate}
                className="rounded-lg border border-slate-300 px-2 py-1 outline-none ring-primary-ring/40 focus:ring"
                onChange={(event) => setWeekFocusDate(event.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {weekDays.map((day) => (
              <div
                key={day.key}
                className={`rounded-2xl border bg-white p-3 shadow-sm ${day.isWeekend ? "border-rose-200" : "border-slate-200"}`}
              >
                <button
                  type="button"
                  className={`mb-2 min-h-12 w-full touch-manipulation border-b pb-2 text-left text-sm font-semibold transition active:bg-slate-50 ${
                    day.isWeekend ? "border-rose-100 text-rose-600" : "border-slate-100 text-slate-800"
                  }`}
                  onClick={() => setSelectedDateDetail(day.key)}
                >
                  {day.weekday} {day.month}/{day.day}
                </button>
                <div className="space-y-1">
                  {getPreviewStaffByDate(day.key).map((member) => {
                    const code = assignments[day.key]?.[member.id] ?? "WORK";
                    const shiftType = getShiftType(code);
                    return (
                      <div
                        key={`${day.key}-${member.id}`}
                        className="flex items-center justify-between rounded-md px-2 py-1 text-xs shadow-sm"
                        style={{ backgroundColor: shiftType.color }}
                      >
                        <span className="truncate">{member.name}</span>
                        <span className="font-semibold">{shiftType.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
