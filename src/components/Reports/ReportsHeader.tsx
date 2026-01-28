import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";
import { Employee } from "@/types/attendance";

interface ReportsHeaderProps {
  employee: Employee;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export function ReportsHeader({ employee, onExport }: ReportsHeaderProps) {
  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Attendance Reports</h1>
              <p className="text-muted-foreground">{employee.name} • {employee.employeeCode}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Reports
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('pdf')} className="gap-2">
                <FileText className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')} className="gap-2">
                <FileBarChart className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

