import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Employee } from "@/types/attendance";

interface CalendarHeaderProps {
  employee: Employee;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function CalendarHeader({ employee, selectedYear, onYearChange }: CalendarHeaderProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{employee.name}</h1>
              <p className="text-muted-foreground">{employee.role} • {employee.employeeCode}</p>
            </div>
          </div>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onYearChange(selectedYear - 1)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Year
          </Button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold text-foreground">{selectedYear}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onYearChange(selectedYear + 1)}
            className="gap-2"
          >
            Next Year
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


