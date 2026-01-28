"use client";

import React from 'react';
import { Report, User } from '@/types/fir';
import { ReportCard } from '@/components/FIR/ReportCard';
import { ReportDetail } from '@/components/FIR/ReportDetail';
import { Plus, Search, ShieldAlert, ChevronRight } from '@/components/FIR/Icons';
import { FIRFilter } from '@/hooks/fir/useFIRStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ReportsViewProps {
    reports: Report[];
    filteredReports: Report[];
    selectedReportId: string | null;
    selectedReport: Report | undefined;
    currentUser: User;
    filter: FIRFilter;
    isLoading: boolean;
    searchQuery: string;
    onSelectReport: (id: string | null) => void;
    onUpdateReport: (report: Report) => void;
    onOpenModal: (type: 'GOOD' | 'BAD') => void;
    onFilterChange: (filter: FIRFilter) => void;
    onSearchChange: (query: string) => void;
}

export function ReportsView({
    filteredReports,
    selectedReportId,
    selectedReport,
    currentUser,
    filter,
    isLoading,
    searchQuery,
    onSelectReport,
    onUpdateReport,
    onOpenModal,
    onFilterChange,
    onSearchChange,
}: ReportsViewProps) {
    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Left Pane: List View */}
            <div
                className={`${selectedReportId ? 'hidden md:flex' : 'flex'
                    } flex-col w-full md:w-[400px] xl:w-[450px] bg-background border-r h-full`}
            >
                {/* Header */}
                <div className="p-4 space-y-4 border-b">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold tracking-tight">
                            All Reports
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-full border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 text-green-600"
                                onPress={() => onOpenModal('GOOD')}
                            >
                                <Plus size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-full border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600"
                                onPress={() => onOpenModal('BAD')}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <FilterTabs filter={filter} onFilterChange={onFilterChange} />

                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={16}
                        />
                        <Input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 bg-muted/50 focus:bg-background transition-colors"
                        />
                    </div>
                </div>

                {/* Report List */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : filteredReports.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                No reports found matching criteria.
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    isSelected={selectedReportId === report.id}
                                    onClick={() => onSelectReport(report.id)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Pane: Detail View */}
            <div
                className={`${selectedReportId ? 'flex' : 'hidden md:flex'
                    } flex-col flex-1 bg-muted/30 h-full relative`}
            >
                {selectedReport ? (
                    <div className="h-full flex flex-col">
                        {/* Mobile Back Button */}
                        <div className="md:hidden p-4 bg-background border-b flex items-center gap-2 sticky top-0 z-30">
                            <Button
                                variant="ghost"
                                size="icon"
                                onPress={() => onSelectReport(null)}
                                className="h-8 w-8"
                            >
                                <ChevronRight
                                    className="rotate-180"
                                    size={20}
                                />
                            </Button>
                            <span className="font-semibold">
                                Report Details
                            </span>
                        </div>

                        <ReportDetail
                            report={selectedReport}
                            onUpdate={onUpdateReport}
                            currentUser={currentUser}
                        />
                    </div>
                ) : (
                    <EmptyDetailState />
                )}
            </div>
        </div>
    );
}

// Sub-components

interface FilterTabsProps {
    filter: FIRFilter;
    onFilterChange: (filter: FIRFilter) => void;
}

function FilterTabs({ filter, onFilterChange }: FilterTabsProps) {
    const tabs: { value: FIRFilter; label: string }[] = [
        { value: 'All', label: 'All' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'MyAction', label: 'My Action' },
    ];

    return (
        <div className="flex p-1 bg-muted rounded-lg">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onFilterChange(tab.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === tab.value
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-card border rounded-xl p-4 animate-pulse space-y-3"
                >
                    <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-8 w-8 bg-muted rounded-full" />
                    </div>
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

function EmptyDetailState() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={40} className="opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
                No Report Selected
            </h3>
            <p className="text-center max-w-xs mt-2 text-sm">
                Select a report from the list to view details, audit trail, and take
                action.
            </p>
        </div>
    );
}
