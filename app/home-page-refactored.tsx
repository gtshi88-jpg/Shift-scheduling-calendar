"use client";

import { useState } from "react";
import {
  HomeNavBottom,
  HomeNavRail,
  type HomeNavPanel,
} from "@/app/components/home/home-navigation";
import {
  CalendarPreviewSection,
  HeaderSection,
  LoadingView,
  LoginView,
  MonthlySummarySection,
  MonthComparisonSection,
  MonthConfirmSection,
  PanelIntro,
  ScheduleHistorySection,
  ShiftPrintSheet,
  StaffJobTypesSection,
  TableInputSection,
  TodayStatusSection,
  WarningsSection,
} from "@/app/components/home/sections/index";
import {
  AddStaffModal,
  CalendarEditorModal,
  CsvImportModal,
  DateDetailModal,
} from "@/app/components/home/modals";
import {
  SHIFT_SHORT_LABEL,
  SHIFT_TYPES,
  useHomePageController,
} from "@/app/home/use-home-page-controller";

export default function HomePageRefactored() {
  const controller = useHomePageController();
  const [navPanel, setNavPanel] = useState<HomeNavPanel>("input");

  if (controller.authLoading) return <LoadingView />;
  if (!controller.user) {
    return (
      <LoginView
        handleLogin={controller.handleLogin}
        loginUsername={controller.loginUsername}
        setLoginUsername={controller.setLoginUsername}
        loginPassword={controller.loginPassword}
        setLoginPassword={controller.setLoginPassword}
        loginError={controller.loginError}
        loginBusy={controller.loginBusy}
      />
    );
  }

  return (
    <>
      <div className="flex bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 text-slate-900 print:hidden max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:min-h-0 max-md:overflow-hidden md:min-h-screen">
        <HomeNavRail panel={navPanel} onPanelChange={setNavPanel} />
        <div className="flex min-w-0 flex-1 flex-col max-md:min-h-0 max-md:overflow-hidden">
          <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pb-2 pt-2 md:px-8 md:pt-6">
            <HeaderSection
              isAdmin={controller.isAdmin}
              user={controller.user}
              handleLogout={controller.handleLogout}
              monthPickerOpen={controller.monthPickerOpen}
              setMonthPickerOpen={controller.setMonthPickerOpen}
              currentMonth={controller.currentMonth}
              saveStatus={controller.saveStatus}
              inputMode={controller.inputMode}
              setInputMode={controller.setInputMode}
              moveMonth={controller.moveMonth}
              miniCalendarCells={controller.miniCalendarCells}
              setCurrentMonth={controller.setCurrentMonth}
              showInputModeToggle={navPanel === "input"}
              staffJobFilter={controller.staffJobFilter}
              setStaffJobFilter={controller.setStaffJobFilter}
              staffJobFilterOptions={controller.staffJobFilterOptions}
            />
          </div>
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-24 pt-2 md:px-8 lg:pb-8 max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:overscroll-y-contain">
            {navPanel === "dashboard" && (
              <>
                <PanelIntro
                  title="ダッシュボード"
                  description="データの警告、今日の稼働サマリー、月次の勤務集計をまとめて確認する画面です。"
                />
                <WarningsSection warnings={controller.warnings} />
                <TodayStatusSection
                  todayKey={controller.todayKey}
                  todayWorkingCount={controller.todayWorkingCount}
                  todayTargetHeadcount={controller.todayTargetHeadcount}
                  mobileTodayPresent={controller.mobileTodayPresent}
                  mobileTodayAbsent={controller.mobileTodayAbsent}
                  assignments={controller.assignments}
                  getShiftType={controller.getShiftType}
                />
                <MonthlySummarySection
                  currentMonth={controller.currentMonth}
                  shiftTypes={SHIFT_TYPES}
                  monthlyTotals={controller.monthlyTotals}
                  showMonthlySummaryMobile={controller.showMonthlySummaryMobile}
                  setShowMonthlySummaryMobile={controller.setShowMonthlySummaryMobile}
                />
                <MonthComparisonSection
                  currentMonthLabel={controller.currentMonthLabel}
                  shiftTypes={SHIFT_TYPES}
                  monthlyTotals={controller.monthlyTotals}
                  monthlyTotalsPrevMonth={controller.monthlyTotalsPrevMonth}
                  monthlyTotalsPrevYearSameMonth={controller.monthlyTotalsPrevYearSameMonth}
                  monthComparisonLabels={controller.monthComparisonLabels}
                />
              </>
            )}
            {navPanel === "shiftCheck" && (
              <>
                <PanelIntro
                  title="シフト確認"
                  description="月・週のカレンダーで誰がいつ勤務かを閲覧します。今日の人数サマリーはダッシュボードをご利用ください。編集は「シフト入力」から行えます。"
                />
                <CalendarPreviewSection
                  currentMonth={controller.currentMonth}
                  previewSortMode={controller.previewSortMode}
                  setPreviewSortMode={controller.setPreviewSortMode}
                  viewMode={controller.viewMode}
                  setViewMode={controller.setViewMode}
                  showRegularOffInMonth={controller.showRegularOffInMonth}
                  setShowRegularOffInMonth={controller.setShowRegularOffInMonth}
                  monthCells={controller.monthCells}
                  weekDays={controller.weekDays}
                  weekFocusDate={controller.weekFocusDate}
                  setWeekFocusDate={controller.setWeekFocusDate}
                  moveWeek={controller.moveWeek}
                  setWeekToToday={controller.setWeekToToday}
                  getPreviewStaffByDate={controller.getPreviewStaffByDate}
                  assignments={controller.assignments}
                  getShiftType={controller.getShiftType}
                  user={controller.user}
                  inputMode={controller.inputMode}
                  openCalendarEditor={controller.openCalendarEditor}
                  setSelectedDateDetail={controller.setSelectedDateDetail}
                  calendarEditingLocked={controller.memberMonthLocked}
                  onPrint={controller.handlePrintSchedule}
                  readOnly
                />
              </>
            )}
            {navPanel === "operations" && (
              <>
                <StaffJobTypesSection
                  isAdmin={controller.isAdmin}
                  jobTypes={controller.jobTypes}
                  createJobType={controller.createStaffJobTypeRemote}
                  updateJobTypeLabel={controller.updateStaffJobTypeLabelRemote}
                  deleteJobType={controller.deleteStaffJobTypeRemote}
                />
                <MonthConfirmSection
                  currentYearMonthKey={controller.currentYearMonthKey}
                  confirmedInfo={controller.confirmedMonths[controller.currentYearMonthKey]}
                  isAdmin={controller.isAdmin}
                  scheduleNotice={controller.scheduleNotice}
                  onDismissNotice={() => controller.setScheduleNotice("")}
                  onConfirm={controller.confirmCurrentMonth}
                  onUnconfirm={controller.unconfirmCurrentMonth}
                />
                <ScheduleHistorySection auditLog={controller.auditLog} />
              </>
            )}
            {navPanel === "input" && (
              <>
                <TableInputSection
                  inputMode={controller.inputMode}
                  tableRangeMode={controller.tableRangeMode}
                  setTableRangeMode={controller.setTableRangeMode}
                  targetWeekday={controller.targetWeekday}
                  setTargetWeekday={controller.setTargetWeekday}
                  targetWeekend={controller.targetWeekend}
                  setTargetWeekend={controller.setTargetWeekend}
                  targetHoliday={controller.targetHoliday}
                  setTargetHoliday={controller.setTargetHoliday}
                  showTableOptions={controller.showTableOptions}
                  setShowTableOptions={controller.setShowTableOptions}
                  holidayDatesInput={controller.holidayDatesInput}
                  setHolidayDatesInput={controller.setHolidayDatesInput}
                  isAdmin={controller.isAdmin}
                  setAddStaffModalOpen={controller.setAddStaffModalOpen}
                  setCsvImportOpen={controller.setCsvImportOpen}
                  visibleMonthDays={controller.visibleMonthDays}
                  monthVisibleStaff={controller.monthVisibleStaff}
                  assignments={controller.assignments}
                  user={controller.user}
                  getShiftType={controller.getShiftType}
                  selectableShiftTypes={controller.selectableShiftTypes}
                  shiftShortLabel={SHIFT_SHORT_LABEL}
                  updateAssignment={controller.updateAssignment}
                  memberMonthLocked={controller.memberMonthLocked}
                  totalsByStaff={controller.totalsByStaff}
                  totalsByDate={controller.totalsByDate}
                  workingCountByDate={controller.workingCountByDate}
                  targetByDate={controller.targetByDate}
                  staffingBalanceSummary={controller.staffingBalanceSummary}
                  moveStaff={controller.moveStaff}
                  removeStaff={controller.removeStaff}
                />
                <CalendarPreviewSection
                  currentMonth={controller.currentMonth}
                  previewSortMode={controller.previewSortMode}
                  setPreviewSortMode={controller.setPreviewSortMode}
                  viewMode={controller.viewMode}
                  setViewMode={controller.setViewMode}
                  showRegularOffInMonth={controller.showRegularOffInMonth}
                  setShowRegularOffInMonth={controller.setShowRegularOffInMonth}
                  monthCells={controller.monthCells}
                  weekDays={controller.weekDays}
                  weekFocusDate={controller.weekFocusDate}
                  setWeekFocusDate={controller.setWeekFocusDate}
                  moveWeek={controller.moveWeek}
                  setWeekToToday={controller.setWeekToToday}
                  getPreviewStaffByDate={controller.getPreviewStaffByDate}
                  assignments={controller.assignments}
                  getShiftType={controller.getShiftType}
                  user={controller.user}
                  inputMode={controller.inputMode}
                  openCalendarEditor={controller.openCalendarEditor}
                  setSelectedDateDetail={controller.setSelectedDateDetail}
                  calendarEditingLocked={controller.memberMonthLocked}
                  onPrint={controller.handlePrintSchedule}
                />
              </>
            )}
          </main>
        </div>
        <HomeNavBottom panel={navPanel} onPanelChange={setNavPanel} />
      </div>
      <CalendarEditorModal
        visible={Boolean(controller.user && controller.inputMode === "calendar" && controller.calendarEditor)}
        calendarEditor={controller.calendarEditor}
        setCalendarEditor={controller.setCalendarEditor}
        getPreviewStaffByDate={controller.getPreviewStaffByDate}
        assignments={controller.assignments}
        selectableShiftTypes={controller.selectableShiftTypes}
        applyCalendarEditor={controller.applyCalendarEditor}
      />
      <DateDetailModal
        selectedDateDetail={controller.selectedDateDetail}
        setSelectedDateDetail={controller.setSelectedDateDetail}
        detailStaffByDate={controller.detailStaffByDate}
      />
      <CsvImportModal
        visible={Boolean(controller.isAdmin && controller.csvImportOpen)}
        setVisible={controller.setCsvImportOpen}
        csvImportErrors={controller.csvImportErrors}
        setCsvImportErrors={controller.setCsvImportErrors}
        csvImportPreview={controller.csvImportPreview}
        setCsvImportPreview={controller.setCsvImportPreview}
        handleCsvFileSelected={controller.handleCsvFileSelected}
        applyCsvImport={controller.applyCsvImport}
      />
      <AddStaffModal
        visible={Boolean(controller.isAdmin && controller.addStaffModalOpen)}
        setVisible={controller.setAddStaffModalOpen}
        newStaffName={controller.newStaffName}
        setNewStaffName={controller.setNewStaffName}
        newStaffJobTypeId={controller.newStaffJobTypeId}
        setNewStaffJobTypeId={controller.setNewStaffJobTypeId}
        counselorJobTypeId={controller.counselorJobTypeId}
        jobTypes={controller.jobTypes}
        submitAddStaff={controller.submitAddStaff}
      />
      <ShiftPrintSheet
        currentMonth={controller.currentMonth}
        monthCells={controller.monthCells}
        assignments={controller.assignments}
        getPreviewStaffByDate={controller.getPreviewStaffByDate}
        getShiftType={controller.getShiftType}
        showRegularOffInMonth={controller.showRegularOffInMonth}
        isConfirmed={Boolean(controller.confirmedMonths[controller.currentYearMonthKey])}
      />
    </>
  );
}
