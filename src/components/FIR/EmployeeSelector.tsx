import React from 'react';
import { Loader2, ChevronRight } from 'lucide-react';

interface Employee {
    id: number;
    employee_name: string;
    employee_code: string;
}

interface EmployeeSelectorProps {
    employees: Employee[];
    loading: boolean;
    onSelect: (employeeId: string) => void;
}

export function EmployeeSelector({ employees, loading, onSelect }: EmployeeSelectorProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="animate-spin mr-2" /> Loading employees...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {employees.map(emp => (
                <button
                    key={emp.id}
                    onClick={() => onSelect(emp.id.toString())}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                >
                    <div>
                        <div className="font-medium text-foreground">{emp.employee_name}</div>
                        <div className="text-sm text-muted-foreground">{emp.employee_code}</div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
            ))}
        </div>
    );
}
