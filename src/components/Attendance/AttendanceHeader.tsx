import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, Wifi, WifiOff } from "lucide-react";
import { Employee } from "@/types/attendance";

interface AttendanceHeaderProps {
  employee: Employee;
  lastUpdate: Date;
  isLoading: boolean;
  onRefresh: () => void;
  onExport?: () => void; // Optional, not used
}

export function AttendanceHeader({ 
  employee, 
  lastUpdate, 
  isLoading, 
  onRefresh, 
  onExport 
}: AttendanceHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-card via-card to-muted/20 border-b border-border">
      <div className="container mx-auto p-6">
        {/* Main Header Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          {/* Employee Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg ring-4 ring-primary/10">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-card"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{employee.name}</h1>
              <p className="text-muted-foreground text-sm font-medium">
                {employee.role} <span className="text-muted-foreground/60">•</span> {employee.employeeCode}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="default"
              disabled={isLoading}
              className="gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {isLoading ? (
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <>
                    <Wifi className="h-4 w-4 text-primary" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  </>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {isLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: <span className="font-medium text-foreground">{lastUpdate.toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold px-4 py-1.5 shadow-sm">
            Real-time Attendance
          </Badge>
        </div>
      </div>
    </div>
  );
}


