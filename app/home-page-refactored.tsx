"use client";

import {
  CalendarPreviewSection,
  HeaderSection,
  LoadingView,
  LoginView,
  MonthlySummarySection,
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 px-4 py-6 text-slate-900 md:px-8 md:py-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
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
          isAdmin={controller.isAdmin}
          openCalendarEditor={controller.openCalendarEditor}
          setSelectedDateDetail={controller.setSelectedDateDetail}
        />
      </main>
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
        submitAddStaff={controller.submitAddStaff}
      />
    </div>
  );
}
