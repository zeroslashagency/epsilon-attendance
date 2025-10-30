import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AttendanceHeader } from "@/components/Attendance/AttendanceHeader";
import { CurrentAttendanceCard } from "@/components/Attendance/CurrentAttendanceCard";
import { RecentAttendanceTable } from "@/components/Attendance/RecentAttendanceTable";
import { AttendanceSummary } from "@/components/Attendance/AttendanceSummary";
import { DayDetailPanel } from "@/components/employee/DayDetailPanel";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useAuth } from "@/hooks/useAuth";
import { ProcessedDayData } from "@/types/attendance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const AttendancePage = () => {
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    data: ProcessedDayData;
  } | null>(null);

  const {
    employeeCode,
    employeeName,
    shouldRestrictToOwnData,
    role,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName
  } = useAuth();

  // Determine which employee code to use
  const activeEmployeeCode = isStandalone ? standaloneEmployeeCode : employeeCode;
  
  console.log('👤 AttendancePage - Auth Context:', {
    employeeCode,
    employeeName,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName,
    activeEmployeeCode,
    role
  });

  // Use the custom hook for real-time attendance data
  const {
    attendanceData,
    isLoading,
    isBackgroundRefreshing,
    error,
    lastUpdate,
    refresh,
    silentRefresh
  } = useAttendanceData({
    employeeCode: activeEmployeeCode,
    enableRealTime: true,
    refreshInterval: 30000 // 30 seconds
  });

  const handleDayClick = (date: string, dayData?: ProcessedDayData) => {
    if (dayData) {
      setSelectedDay({ date, data: dayData });
    } else {
      toast.info("No attendance data available for this date");
    }
  };

  const handleRefresh = async () => {
    try {
      // Show a subtle loading indicator instead of blocking the UI
      const toastId = toast.loading("Refreshing attendance data...");
      await refresh();
      toast.success("Attendance data refreshed", { id: toastId });
    } catch (error) {
      toast.error("Failed to refresh attendance data");
    }
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

  // Silent refresh for Today's Attendance every 5 seconds
  useEffect(() => {
    const silentRefreshInterval = setInterval(() => {
      silentRefresh();
    }, 5000); // 5 seconds

    return () => clearInterval(silentRefreshInterval);
  }, [silentRefresh]);

  // Convert ProcessedDayData to the format expected by DayDetailPanel
  const selectedDayDetail = selectedDay ? {
    date: selectedDay.date,
    status: selectedDay.data.status,
    punchLogs: selectedDay.data.punchLogs || [],
    intervals: selectedDay.data.intervals || [],
    totalWorkTime: selectedDay.data.totalHours || "0:00",
    confidence: selectedDay.data.confidence || 'high',
    hasAmbiguousPunches: selectedDay.data.hasAmbiguousPunches || false,
    isConfirmed: false,
    importedAt: new Date().toISOString(),
    corrections: undefined
  } : null;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Role-based access info - Only show for non-standalone restricted users */}
      {shouldRestrictToOwnData() && !isStandalone && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You are viewing attendance data for <strong>{employeeName}</strong> (Employee Code: <strong>{employeeCode}</strong>) only. 
            Your role ({role}) restricts access to your own attendance records.
          </AlertDescription>
        </Alert>
      )}

      {/* Attendance Header */}
      <AttendanceHeader 
        employee={{
          id: (isStandalone ? standaloneEmployeeCode : employeeCode) || '',
          name: (isStandalone ? standaloneEmployeeName : employeeName) || 'Unknown Employee',
          role: 'Employee',
          employeeCode: (isStandalone ? standaloneEmployeeCode : employeeCode) || '',
          email: `${((isStandalone ? standaloneEmployeeCode : employeeCode) || 'unknown').toLowerCase()}@company.com`,
          phone: '+91-XXXX-XXXX',
          joinDate: '2024-01-01',
          avatar: '',
          location: 'Main Office'
        }}
        lastUpdate={lastUpdate}
        isLoading={isBackgroundRefreshing}
        onRefresh={handleRefresh}
        onExport={() => toast.success("Attendance data exported successfully!")}
      />
      
      {/* Background Refresh Indicator - Subtle & Non-intrusive */}
      {isBackgroundRefreshing && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 text-green-700 px-3 py-2 rounded-lg shadow-sm border border-green-200 transition-all duration-300">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Syncing...</span>
            <span className="text-green-600">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Current Attendance Status - Full Width */}
      <div className="w-full">
        <CurrentAttendanceCard 
          attendanceData={attendanceData}
          isLoading={isLoading && Object.keys(attendanceData).length === 0}
        />
      </div>

      {/* Main Content Grid - Optimized for full width */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
        <div className="lg:col-span-3">
          <RecentAttendanceTable 
            attendanceData={attendanceData}
            onDayClick={handleDayClick}
            isLoading={isLoading && Object.keys(attendanceData).length === 0}
          />
        </div>
        <div className="lg:col-span-1">
          <AttendanceSummary 
            attendanceData={attendanceData}
            isLoading={isLoading && Object.keys(attendanceData).length === 0}
          />
        </div>
      </div>

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

export default AttendancePage;
