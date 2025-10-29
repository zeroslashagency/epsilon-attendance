import { Card, CardContent } from "@/components/ui/card";
import { LeaveBalance } from "@/types/attendance";

interface LeaveBalanceCardProps {
  leaveBalance: LeaveBalance;
}

export function LeaveBalanceCard({ leaveBalance }: LeaveBalanceCardProps) {
  return (
    <Card className="bg-background border-border">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Leave Balance</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Vacation</span>
            <span className="text-sm font-medium">{leaveBalance.vacation.used}/{leaveBalance.vacation.total} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Sick Leave</span>
            <span className="text-sm font-medium">{leaveBalance.sick.used}/{leaveBalance.sick.total} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


