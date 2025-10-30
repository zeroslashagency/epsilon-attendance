import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Employee, AttendanceStats, ProcessedDayData } from "@/types/attendance";

interface ExportButtonProps {
  employee: Employee;
  stats: AttendanceStats;
  attendanceData: Record<string, ProcessedDayData>;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ExportButton({ 
  variant = "outline",
  size = "default",
  className = ""
}: ExportButtonProps) {
  // Export functionality removed - will be implemented when backend is ready
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`gap-2 ${className}`}
      disabled
      title="Export feature coming soon"
    >
      <Download className="h-4 w-4" />
      Export Data
    </Button>
  );
}


