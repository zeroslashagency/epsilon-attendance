import { useState } from "react";
import { toast } from "sonner";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import { AttendanceCalendar } from "@/components/employee/AttendanceCalendar";
import { DayDetailPanel } from "@/components/employee/DayDetailPanel";
import { ProcessedDayData } from "@/types/attendance";
import { useAuth } from "@/hooks/useAuth";
import { useAttendanceData } from "@/hooks/useAttendanceData";

const CalendarPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    data: ProcessedDayData;
  } | null>(null);
  
  const {
    employeeCode,
    employeeName,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName
  } = useAuth();
  
  // Fetch real attendance data
  const {
    attendanceData,
    isLoading,
    error
  } = useAttendanceData({
    employeeCode: isStandalone ? standaloneEmployeeCode : employeeCode,
    enableRealTime: true,
    refreshInterval: 30000
  });

  const handleDayClick = (date: string, dayData?: ProcessedDayData) => {
    if (dayData) {
      setSelectedDay({ date, data: dayData });
    } else {
      toast.info("No attendance data available for this date");
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleConfirmDay = () => {
    if (selectedDay) {
      toast.success("Day attendance confirmed successfully");
      setSelectedDay(null);
    }
  };

  const handleEditDay = () => {
    toast.info("Edit functionality would open here");
  };

  const handleRequestCorrection = () => {
    toast.info("Correction request form would open here");
  };

  // Convert ProcessedDayData to the format expected by DayDetailPanel
  const selectedDayDetail = selectedDay ? {
    date: selectedDay.date,
    status: selectedDay.data.status,
    punchLogs: selectedDay.data.punchLogs,
    intervals: selectedDay.data.intervals,
    totalWorkTime: selectedDay.data.totalHours || "0:00",
    confidence: selectedDay.data.confidence,
    hasAmbiguousPunches: selectedDay.data.hasAmbiguousPunches,
    isConfirmed: false,
    importedAt: new Date().toISOString(),
    corrections: undefined
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <CalendarHeader 
        employee={{
          id: (isStandalone ? standaloneEmployeeCode : employeeCode) || '',
          name: (isStandalone ? standaloneEmployeeName : employeeName) || 'Employee',
          role: 'Employee',
          employeeCode: (isStandalone ? standaloneEmployeeCode : employeeCode) || '',
          email: `${((isStandalone ? standaloneEmployeeCode : employeeCode) || 'employee').toLowerCase()}@company.com`,
          phone: '+91-XXXX-XXXX',
          joinDate: '2024-01-01',
          avatar: '',
          location: 'Main Office'
        }}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      {/* Calendar Component */}
      <AttendanceCalendar
        year={selectedYear}
        data={attendanceData}
        onDayClick={handleDayClick}
      />

      {/* Day Detail Panel */}
      <DayDetailPanel
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        data={selectedDayDetail}
        onConfirm={handleConfirmDay}
        onEdit={handleEditDay}
        onRequestCorrection={handleRequestCorrection}
      />
    </div>
  );
};

export default CalendarPage;


