"use client";

import React from 'react';
import { Report, Priority, ReportStatus } from '@/types/fir';
import { DashboardStats } from '@/components/FIR/DashboardStats';
import { Plus, ShieldAlert, ChevronRight } from '@/components/FIR/Icons';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardViewProps {
    reports: Report[];
    onOpenModal: (type: 'GOOD' | 'BAD') => void;
    onSelectReport: (id: string) => void;
    onNavigateToReports: () => void;
}

export function DashboardView({
    reports,
    onOpenModal,
    onSelectReport,
    onNavigateToReports,
}: DashboardViewProps) {
    const handleReportClick = (reportId: string) => {
        onSelectReport(reportId);
        onNavigateToReports();
    };

    return (
        <div className="h-full overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Overview of your error reports and pending actions
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onPress={() => onOpenModal('GOOD')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus size={16} className="mr-2" /> Positive
                        </Button>
                        <Button
                            onPress={() => onOpenModal('BAD')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Plus size={16} className="mr-2" /> Negative
                        </Button>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1">
                        <React.Suspense
                            fallback={
                                <div className="text-muted-foreground">
                                    Loading stats...
                                </div>
                            }
                        >
                            <DashboardStats reports={reports} />
                        </React.Suspense>
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Recent Reports
                    </h2>
                    <Card>
                        <div className="divide-y divide-border">
                            {reports.length === 0 ? (
                                <EmptyState onOpenModal={onOpenModal} />
                            ) : (
                                reports.slice(0, 5).map((report) => (
                                    <ReportRow
                                        key={report.id}
                                        report={report}
                                        onClick={() => handleReportClick(report.id)}
                                    />
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code

interface ReportRowProps {
    report: Report;
    onClick: () => void;
}

function ReportRow({ report, onClick }: ReportRowProps) {
    const isPriorityHigh = report.priority === Priority.High;
    const isClosed = report.status === ReportStatus.Closed;

    return (
        <div
            onClick={onClick}
            className="p-4 hover:bg-muted/50 cursor-pointer transition flex items-center gap-4 group"
        >
            <div
                className={`p-2 rounded-lg ${isPriorityHigh
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-muted text-muted-foreground'
                    }`}
            >
                <ShieldAlert size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {report.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                    {report.description}
                </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
                <Badge
                    variant={isClosed ? "secondary" : "default"}
                    className={isClosed
                        ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'}
                >
                    {report.status}
                </Badge>
                <div className="text-xs text-muted-foreground">
                    {new Date(report.reportedAt).toLocaleDateString()}
                </div>
            </div>

            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
    );
}

interface EmptyStateProps {
    onOpenModal: (type: 'GOOD' | 'BAD') => void;
}

function EmptyState({ onOpenModal }: EmptyStateProps) {
    return (
        <div className="p-10 text-center">
            <p className="text-muted-foreground mb-4">
                No reports found. Create your first report!
            </p>
            <div className="flex justify-center gap-3">
                <Button
                    onPress={() => onOpenModal('GOOD')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    + Positive
                </Button>
                <Button
                    onPress={() => onOpenModal('BAD')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    + Negative
                </Button>
            </div>
        </div>
    );
}
