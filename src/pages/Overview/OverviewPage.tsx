// Overview Page - Updated 2025-10-11 03:27 - Fixed generateMockYearData error
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { OverviewHeader } from "@/components/Overview/OverviewHeader";
import { OverviewStats } from "@/components/Overview/OverviewStats";
import { LeaveBalanceCard } from "@/components/Overview/LeaveBalanceCard";
import { DayDetailPanel } from "@/components/employee/DayDetailPanel";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useAuth } from "@/hooks/useAuth";
import { ProcessedDayData } from "@/types/attendance";

// Mock data for leave balance (temporary until backend is ready)
const mockLeaveBalance = {
  casual: { used: 0, total: 12, available: 12 },
  sick: { used: 0, total: 10, available: 10 },
  earned: { used: 0, total: 15, available: 15 },
  vacation: { used: 0, total: 20, available: 20 }
};

// Calculate attendance statistics
const calculateAttendanceStats = (data: Record<string, ProcessedDayData>) => {
  const days = Object.values(data);
  const totalDays = days.length;
  // Case-insensitive status comparison to handle database capitalization
  const presentDays = days.filter(d => d.status.toLowerCase() === 'present').length;
  const lateDays = days.filter(d => d.status.toLowerCase() === 'late').length;
  const absentDays = days.filter(d => d.status.toLowerCase() === 'absent').length;
  const sickDays = days.filter(d => d.status.toLowerCase() === 'sick').length;
  const vacationDays = days.filter(d => d.status.toLowerCase() === 'vacation').length;
  
  // Total attendance includes both present and late (they showed up)
  const totalAttendance = presentDays + lateDays;
  
  return {
    totalAttendance,
    workingDays: totalDays,
    avgCheckIn: '09:00',
    avgCheckOut: '18:00',
    sickDays,
    vacationDays,
    lateDays,
    ambiguousEntries: 0,
    attendanceRate: totalDays > 0 ? Math.round((totalAttendance / totalDays) * 100) : 0,
    presentDays,
    absentDays,
    totalDays
  };
};

const OverviewPage = () => {
  // Fixed: Removed generateMockYearData reference - using real data now
  const {
    employeeCode,
    employeeName,
    isStandalone,
    standaloneEmployeeCode,
    standaloneEmployeeName
  } = useAuth();

  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    data: ProcessedDayData;
  } | null>(null);
  
  // Get the effective employee code
  const effectiveEmployeeCode = isStandalone ? standaloneEmployeeCode : employeeCode;
  
  // Use real attendance data
  const {
    attendanceData,
    isLoading,
    error,
    lastUpdate,
    refresh
  } = useAttendanceData({
    employeeCode: effectiveEmployeeCode || '',
    enableRealTime: true,
    refreshInterval: 30000
  });

  // Calculate stats with error handling - memoized for performance
  const stats = useMemo(() => {
    if (!attendanceData || Object.keys(attendanceData).length === 0) {
      return {
        totalAttendance: 0,
        workingDays: 0,
        avgCheckIn: '00:00',
        avgCheckOut: '00:00',
        sickDays: 0,
        vacationDays: 0,
        lateDays: 0,
        ambiguousEntries: 0,
        attendanceRate: 0,
        presentDays: 0,
        absentDays: 0,
        totalDays: 0
      };
    }
    return calculateAttendanceStats(attendanceData);
  }, [attendanceData]);

  const handleDayClick = (date: string, dayData?: ProcessedDayData) => {
    if (dayData) {
      setSelectedDay({ date, data: dayData });
    } else {
      toast.info("No attendance data available for this date");
    }
  };

  const handleStatClick = (statType: string) => {
    toast.info(`Showing detailed view for: ${statType}`);
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

  // Convert ProcessedDayData to the format expected by DayDetailPanel - memoized for performance
  const selectedDayDetail = useMemo(() => {
    if (!selectedDay) return null;
    
    return {
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
    };
  }, [selectedDay]);

  // Show error state if no employee code is available
  if (!effectiveEmployeeCode) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-yellow-600 mb-4">No employee code found. Please ensure you are logged in correctly.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Only show loading skeleton on initial load when there's no data
  if (isLoading && Object.keys(attendanceData).length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading overview data: {error}</p>
          <p className="text-sm text-gray-600 mb-4">Employee Code: {effectiveEmployeeCode}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Overview Header */}
      <OverviewHeader 
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
        stats={stats}
        attendanceData={attendanceData}
        onExport={() => toast.success("Attendance data exported successfully!")}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <OverviewStats 
            stats={stats}
            onStatClick={handleStatClick}
          />
        </div>
        <div>
          <LeaveBalanceCard leaveBalance={mockLeaveBalance} />
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

export default OverviewPage;


