import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportsFiltersProps {
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    reportType: 'daily' | 'monthly' | 'yearly';
    includeWeekends: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function ReportsFilters({ filters, onFiltersChange }: ReportsFiltersProps) {
  const handleDateRangeChange = (type: 'start' | 'end', date: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date
      }
    });
  };

  const handleReportTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      reportType: type as 'daily' | 'monthly' | 'yearly'
    });
  };

  const handleIncludeWeekendsChange = (include: boolean) => {
    onFiltersChange({
      ...filters,
      includeWeekends: include
    });
  };

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Start */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.start ? format(filters.dateRange.start, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.start}
                  onSelect={(date) => date && handleDateRangeChange('start', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range End */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.end ? format(filters.dateRange.end, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.end}
                  onSelect={(date) => date && handleDateRangeChange('end', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={filters.reportType} onValueChange={handleReportTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="yearly">Yearly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Weekends */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeWeekends"
                checked={filters.includeWeekends}
                onChange={(e) => handleIncludeWeekendsChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="includeWeekends" className="text-sm">
                Include Weekends
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


