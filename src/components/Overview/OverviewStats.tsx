import { AttendanceStats as AttendanceStatsType } from "@/types/attendance";
import { AttendanceStats } from "@/components/employee/AttendanceStats";

interface OverviewStatsProps {
  stats: AttendanceStatsType;
  onStatClick: (statType: string) => void;
}

export function OverviewStats({ stats, onStatClick }: OverviewStatsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Attendance Statistics</h2>
      <AttendanceStats 
        stats={stats}
        onStatClick={onStatClick}
      />
    </div>
  );
}


