import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Clock, Wifi, WifiOff } from "lucide-react";
import { Employee } from "@/types/attendance";

interface AttendanceHeaderProps {
  employee: Employee;
  lastUpdate: Date;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function AttendanceHeader({ 
  employee, 
  lastUpdate, 
  isLoading, 
  onRefresh, 
  onExport 
}: AttendanceHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.role} • {employee.employeeCode}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={onExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <WifiOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Wifi className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {isLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
            Real-time Attendance
          </Badge>
        </div>
      </div>
    </div>
  );
}


