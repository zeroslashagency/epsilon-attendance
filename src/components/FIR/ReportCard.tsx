import React from 'react';
import { Report, ReportStatus, Priority } from '@/types/fir';
import { ShieldAlert, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ReportCardProps {
    report: Report;
    isSelected: boolean;
    onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, isSelected, onClick }) => {

    // Helper for Priority Badge Color
    const getPriorityVariant = (priority: Priority): BadgeProps["variant"] => {
        switch (priority) {
            case Priority.High: return "destructive";
            case Priority.Medium: return "default"; // Will map to primary (use custom class if needed)
            case Priority.Low: return "secondary";
            default: return "outline";
        }
    };

    const isClosed = report.status === ReportStatus.Closed;

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all hover:shadow-md border-transparent",
                isSelected ? "border-primary bg-accent/5" : "border-border hover:border-primary/50",
                "shadow-sm"
            )}
            onClick={onClick}
        >
            <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(report.priority)} className="text-[10px] px-1.5 h-5">
                            {report.priority}
                        </Badge>
                        {report.fir_type === 'GOOD' && (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px] px-1.5 h-5">
                                Good Catch
                            </Badge>
                        )}
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {report.title}
                    </h3>
                </div>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={report.reporter.avatar} alt={report.reporter.name} />
                    <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {report.description}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                </div>
                <div className={cn(
                    "font-medium",
                    isClosed ? "text-green-600" : "text-blue-600"
                )}>
                    {report.status}
                </div>
            </CardFooter>
        </Card>
    );
};
