
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

/**
 * FIR (First Information Report) Dashboard Page
 * Features a stats overview and recent reports
 */
const FIRPage = () => {
    const { employeeName } = useAuth();

    // Mock data for stats - replace with real data fetching later
    const stats = [
        { title: "Total Reports", value: "12", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Resolved", value: "8", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
        { title: "Pending", value: "3", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
        { title: "Rejected", value: "1", icon: XCircle, color: "text-red-600", bg: "bg-red-100" }
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">FIR Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {employeeName || 'User'}. Here's an overview of mistake reports.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="card-shadow border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Reports Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 card-shadow border-none">
                    <CardHeader>
                        <CardTitle>Recent Reports</CardTitle>
                        <CardDescription>
                            Recent mistake reports filed in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            No recent activity to display
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 card-shadow border-none">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common actions for FIR management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add quick action buttons here later */}
                        <div className="text-sm text-muted-foreground">
                            Quick actions coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FIRPage;
