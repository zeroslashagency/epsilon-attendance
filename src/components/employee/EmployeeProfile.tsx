import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calendar, MapPin, Clock } from "lucide-react";

interface EmployeeProfileProps {
  employee: {
    id: string;
    name: string;
    role: string;
    employeeCode: string;
    email: string;
    phone: string;
    joinDate: string;
    avatar: string;
    location: string;
  };
  leaveBalance: {
    vacation: { used: number; total: number };
    sick: { used: number; total: number };
  };
  onExport: () => void;
}

export function EmployeeProfile({ employee, leaveBalance, onExport }: EmployeeProfileProps) {
  return (
    <Card className="bg-gradient-card border-border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-lg">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
              <p className="text-muted-foreground">{employee.role}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">#{employee.employeeCode}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {employee.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {employee.joinDate}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Vacation: </span>
              <span className="font-medium">
                {leaveBalance.vacation.total - leaveBalance.vacation.used}d / {leaveBalance.vacation.total}d
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Sick Leave: </span>
              <span className="font-medium">
                {leaveBalance.sick.total - leaveBalance.sick.used}d / {leaveBalance.sick.total}d
              </span>
            </div>
          </div>
          
          <Button onClick={onExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}