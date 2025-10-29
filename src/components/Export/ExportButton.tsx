import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";
import { ExportService } from "./ExportService";
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
  employee, 
  stats, 
  attendanceData, 
  variant = "outline",
  size = "default",
  className = ""
}: ExportButtonProps) {
  const exportData = {
    employee,
    stats,
    attendanceData
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    switch (format) {
      case 'excel':
        await ExportService.exportToExcel(exportData);
        break;
      case 'pdf':
        await ExportService.exportToPDF(exportData);
        break;
      case 'csv':
        await ExportService.exportToCSV(exportData);
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
          <FileBarChart className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


