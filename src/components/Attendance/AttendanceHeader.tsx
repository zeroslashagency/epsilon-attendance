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
    <div className="bg-card border-b border-border">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold shadow-sm">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
              <p className="text-muted-foreground text-sm">{employee.role} • {employee.employeeCode}</p>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Wifi className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium text-foreground">
                {isLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <Badge className="bg-primary text-primary-foreground font-medium">
            Real-time Attendance
          </Badge>
        </div>
      </div>
    </div>
  );
}


