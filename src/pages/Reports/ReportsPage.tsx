import { useState } from "react";
import { ReportsHeader } from "@/components/Reports/ReportsHeader";
import { ReportsFilters } from "@/components/Reports/ReportsFilters";
import { ReportsCharts } from "@/components/Reports/ReportsCharts";
import { ReportsTable } from "@/components/Reports/ReportsTable";
import { mockEmployee } from "@/utils/attendanceData";

const ReportsPage = () => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
      end: new Date()
    },
    reportType: 'monthly' as 'daily' | 'monthly' | 'yearly',
    includeWeekends: false
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting reports as ${format}`, filters);
  };

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <ReportsHeader 
        employee={mockEmployee}
        onExport={handleExport}
      />

      {/* Filters */}
      <ReportsFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Charts Section */}
      <ReportsCharts filters={filters} />

      {/* Table Section */}
      <ReportsTable filters={filters} />
    </div>
  );
};

export default ReportsPage;


