"use client";

import type { StaffJobTypeRecord, StaffMember } from "@/app/types";
import type { TodayStatusSectionProps } from "@/app/components/home/sections/types";

type JobTypeGroup = { key: string; label: string; members: StaffMember[] };

function groupMembersByJobType(members: StaffMember[], jobTypes: StaffJobTypeRecord[]): JobTypeGroup[] {
  if (members.length === 0) return [];
  const knownIds = new Set(jobTypes.map((j) => j.id));
  const sorted = [...jobTypes].sort((a, b) => a.sortOrder - b.sortOrder);
  const out: JobTypeGroup[] = [];
  for (const jt of sorted) {
    const ms = members.filter((m) => m.jobTypeId === jt.id);
    if (ms.length > 0) out.push({ key: jt.id, label: jt.label, members: ms });
  }
  const orphan = members.filter((m) => !knownIds.has(m.jobTypeId));
  if (orphan.length > 0) out.push({ key: "__other__", label: "その他", members: orphan });
  return out;
}

function ShiftBadges({
  members,
  todayKey,
  assignments,
  getShiftType,
  keyPrefix,
}: Pick<TodayStatusSectionProps, "todayKey" | "assignments" | "getShiftType"> & {
  members: StaffMember[];
  keyPrefix: string;
}) {
  return (
    <>
      {members.map((member) => {
        const code = assignments[todayKey]?.[member.id] ?? "WORK";
        const shiftType = getShiftType(code);
        return (
          <span
            key={`${keyPrefix}-${member.id}`}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: shiftType.color }}
          >
            {member.name} {shiftType.label}
          </span>
        );
      })}
    </>
  );
}

export function TodayStatusSection({
  todayKey,
  todayWorkingCount,
  todayTargetHeadcount,
  mobileTodayPresent,
  mobileTodayAbsent,
  assignments,
  getShiftType,
  staffJobFilter,
  setStaffJobFilter,
  staffJobFilterOptions,
  jobTypes,
}: TodayStatusSectionProps) {
  const showGrouped = staffJobFilter === "all" && jobTypes.length > 0;
  const presentGroups = showGrouped ? groupMembersByJobType(mobileTodayPresent, jobTypes) : null;
  const absentGroups = showGrouped ? groupMembersByJobType(mobileTodayAbsent, jobTypes) : null;

  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">今日の出勤状況</h2>
        <span className="text-xs text-slate-500">{todayKey}</span>
      </div>
      <div className="mt-3 md:hidden">
        <label className="block text-xs font-medium text-slate-600" htmlFor="today-status-job-filter">
          表示する職種
        </label>
        <select
          id="today-status-job-filter"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
          value={staffJobFilter}
          onChange={(event) => setStaffJobFilter(event.target.value)}
        >
          {staffJobFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">稼働人数 / 目標</p>
        <p className="mt-1 text-lg font-bold text-slate-900">
          {todayWorkingCount} / {todayTargetHeadcount}
          <span
            className={`ml-2 text-sm ${
              todayWorkingCount - todayTargetHeadcount < 0
                ? "text-rose-700"
                : todayWorkingCount - todayTargetHeadcount > 0
                  ? "text-emerald-700"
                  : "text-slate-500"
            }`}
          >
            ({todayWorkingCount - todayTargetHeadcount >= 0 ? "+" : ""}
            {todayWorkingCount - todayTargetHeadcount})
          </span>
        </p>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-600">出勤中</p>
        {mobileTodayPresent.length === 0 ? (
          <span className="mt-2 block text-xs text-slate-400">出勤者なし</span>
        ) : showGrouped && presentGroups ? (
          <div className="mt-2 space-y-3">
            {presentGroups.map((g) => (
              <div key={`present-${g.key}`}>
                <p className="text-[11px] font-medium text-slate-500">{g.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <ShiftBadges
                    members={g.members}
                    todayKey={todayKey}
                    assignments={assignments}
                    getShiftType={getShiftType}
                    keyPrefix={`present-${g.key}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <ShiftBadges
              members={mobileTodayPresent}
              todayKey={todayKey}
              assignments={assignments}
              getShiftType={getShiftType}
              keyPrefix="present"
            />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-600">不在（休暇/公休/欠勤）</p>
        {mobileTodayAbsent.length === 0 ? (
          <span className="mt-2 block text-xs text-slate-400">不在者なし</span>
        ) : showGrouped && absentGroups ? (
          <div className="mt-2 space-y-3">
            {absentGroups.map((g) => (
              <div key={`absent-${g.key}`}>
                <p className="text-[11px] font-medium text-slate-500">{g.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <ShiftBadges
                    members={g.members}
                    todayKey={todayKey}
                    assignments={assignments}
                    getShiftType={getShiftType}
                    keyPrefix={`absent-${g.key}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <ShiftBadges
              members={mobileTodayAbsent}
              todayKey={todayKey}
              assignments={assignments}
              getShiftType={getShiftType}
              keyPrefix="absent"
            />
          </div>
        )}
      </div>
    </section>
  );
}
