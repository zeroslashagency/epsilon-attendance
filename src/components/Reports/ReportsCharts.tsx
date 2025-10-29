import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ReportsChartsProps {
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    reportType: 'daily' | 'monthly' | 'yearly';
    includeWeekends: boolean;
  };
}

// Mock data for charts
const attendanceByMonth = [
  { month: 'Jan', present: 22, late: 2, absent: 0 },
  { month: 'Feb', present: 20, late: 1, absent: 1 },
  { month: 'Mar', present: 23, late: 0, absent: 0 },
  { month: 'Apr', present: 21, late: 3, absent: 0 },
  { month: 'May', present: 22, late: 1, absent: 0 },
  { month: 'Jun', present: 20, late: 2, absent: 1 },
];

const attendanceDistribution = [
  { name: 'Present', value: 85, color: '#22c55e' },
  { name: 'Late', value: 10, color: '#eab308' },
  { name: 'Absent', value: 5, color: '#ef4444' },
];

export function ReportsCharts({ filters }: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Attendance Chart */}
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Monthly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="late" fill="#eab308" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Distribution */}
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {attendanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {attendanceDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


