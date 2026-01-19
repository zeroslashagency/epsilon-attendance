import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Monitor,
    Clock,
    Smartphone,
    Wifi,
    Bluetooth,
    RefreshCw,
    Download,
    Calendar,
    Users,
    Activity,
    TrendingUp,
    Zap,
    HardDrive,
    Power,
    List
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    fetchTodaySummary,
    fetchScreenTimeLogs,
    fetchAppUsageLogs,
    fetchNetworkLogs,
    fetchBluetoothLogs,
    fetchStorageLogs,
    fetchDeviceEvents,
    fetchScreenTimeByEmployee,
    formatMinutes,
    formatBytes,
    getCategoryColor,
    sendDeviceNotification,
    subscribeToMonitoringUpdates,
    type ScreenTimeLog,
    type AppUsageLog,
    type NetworkLog,
    type BluetoothLog,
    type StorageLog,
    type DeviceEvent,
    type DeviceNotification,
} from "@/services/deviceMonitoringService";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Stat Card Component
function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    loading = false,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    trend?: { value: number; label: string };
    loading?: boolean;
}) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs mt-2",
                        trend.value >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        <TrendingUp className={cn("h-3 w-3", trend.value < 0 && "rotate-180")} />
                        <span>{Math.abs(trend.value)}% {trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Empty State Component
function EmptyState({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">{description}</p>
        </div>
    );
}

// Package name to domain mapping for popular apps
const packageToDomain: Record<string, string> = {
    'com.instagram.android': 'instagram.com',
    'com.whatsapp': 'whatsapp.com',
    'com.google.android.youtube': 'youtube.com',
    'com.facebook.katana': 'facebook.com',
    'com.twitter.android': 'twitter.com',
    'com.snapchat.android': 'snapchat.com',
    'com.spotify.music': 'spotify.com',
    'com.netflix.mediaclient': 'netflix.com',
    'com.amazon.mShop.android.shopping': 'amazon.com',
    'com.linkedin.android': 'linkedin.com',
    'com.pinterest': 'pinterest.com',
    'com.google.android.apps.maps': 'maps.google.com',
    'com.google.android.gm': 'gmail.com',
    'com.google.android.apps.docs': 'docs.google.com',
    'com.microsoft.teams': 'teams.microsoft.com',
    'com.slack': 'slack.com',
    'com.discord': 'discord.com',
    'com.telegram.messenger': 'telegram.org',
    'com.zhiliaoapp.musically': 'tiktok.com',
    'com.amazon.kindle': 'kindle.amazon.com',
    'com.openai.chatgpt': 'openai.com',
    'com.google.android.apps.nbu.paisa.user': 'pay.google.com',
};

// Get initials from app name
function getAppInitials(appName: string): string {
    // Clean up common prefixes
    const cleanName = appName
        .replace(/^com\.\w+\./, '')
        .replace(/\.android$/, '')
        .replace(/android/gi, '');

    const words = cleanName.split(/[\s._-]+/).filter(w => w.length > 0);

    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return appName.substring(0, 2).toUpperCase();
}

// App Icon Component with Clearbit + Initials fallback
function AppIcon({
    packageName,
    appName,
    category
}: {
    packageName?: string;
    appName: string;
    category: string;
}) {
    const [imageError, setImageError] = useState(false);
    const domain = packageName ? packageToDomain[packageName] : null;
    const clearbitUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
    const categoryColor = getCategoryColor(category);
    const initials = getAppInitials(appName);

    // If we have a domain and image hasn't errored, try Clearbit
    if (clearbitUrl && !imageError) {
        return (
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${categoryColor}15` }}
            >
                <img
                    src={clearbitUrl}
                    alt={appName}
                    className="w-7 h-7 object-contain"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    // Fallback: Colored initials
    return (
        <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: categoryColor }}
        >
            <span className="text-white text-sm font-bold">{initials}</span>
        </div>
    );
}

// App Usage Item Component with smart icon
function AppUsageItem({ app }: { app: { appName: string; category: string; totalMinutes: number; packageName?: string } }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <AppIcon
                packageName={app.packageName}
                appName={app.appName}
                category={app.category}
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{app.appName}</p>
                <p className="text-xs text-muted-foreground capitalize">{app.category}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold">{formatMinutes(app.totalMinutes)}</p>
            </div>
        </div>
    );
}

// Category Bar Component
function CategoryBar({ category, minutes, percentage }: { category: string; minutes: number; percentage: number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{category}</span>
                <span className="text-muted-foreground">{formatMinutes(minutes)} ({percentage}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category)
                    }}
                />
            </div>
        </div>
    );
}

export default function DeviceMonitoringPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Summary data
    const [summary, setSummary] = useState<{
        screenTime: { totalMinutes: number; totalUnlocks: number; averageMinutes: number; activeDevices: number };
        topApps: Array<{ appName: string; category: string; totalMinutes: number; packageName: string }>;
        categoryBreakdown: Array<{ category: string; totalMinutes: number; percentage: number }>;
        networkUsage: { wifi: number; mobile: number };
        bluetoothDevices: number;
        storageUsage?: StorageLog;
    } | null>(null);

    // Detailed data for tabs
    const [screenTimeLogs, setScreenTimeLogs] = useState<ScreenTimeLog[]>([]);
    const [appUsageLogs, setAppUsageLogs] = useState<AppUsageLog[]>([]);
    const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);
    const [bluetoothLogs, setBluetoothLogs] = useState<BluetoothLog[]>([]);
    const [storageLogs, setStorageLogs] = useState<StorageLog[]>([]);
    const [deviceEvents, setDeviceEvents] = useState<DeviceEvent[]>([]);
    const [employeeScreenTime, setEmployeeScreenTime] = useState<Array<{ employeeCode: string; totalMinutes: number; unlockCount: number; devices: number }>>([]);

    // Notification state
    const { toast } = useToast();
    const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationBody, setNotificationBody] = useState("");
    const [notificationType, setNotificationType] = useState<DeviceNotification['notification_type']>("alert");
    const [isSendingNotification, setIsSendingNotification] = useState(false);

    const handleSendNotification = async () => {
        if (!selectedEmployee || !notificationTitle || !notificationBody) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsSendingNotification(true);
        try {
            const success = await sendDeviceNotification(
                selectedEmployee,
                notificationTitle,
                notificationBody,
                notificationType
            );

            if (success) {
                toast({
                    title: "Success",
                    description: `Notification sent to ${selectedEmployee}.`,
                });
                setIsNotificationDialogOpen(false);
                setNotificationTitle("");
                setNotificationBody("");
            } else {
                throw new Error("Failed to send notification");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send notification. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSendingNotification(false);
        }
    };

    const openNotificationDialog = (employeeCode: string) => {
        setSelectedEmployee(employeeCode);
        setIsNotificationDialogOpen(true);
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryData, screenTime, appUsage, network, bluetooth, storage, events, byEmployee] = await Promise.all([
                fetchTodaySummary(),
                fetchScreenTimeLogs(),
                fetchAppUsageLogs(),
                fetchNetworkLogs(),
                fetchBluetoothLogs(),
                fetchStorageLogs(),
                fetchDeviceEvents(),
                fetchScreenTimeByEmployee(),
            ]);

            setSummary(summaryData);
            setScreenTimeLogs(screenTime);
            setAppUsageLogs(appUsage);
            setNetworkLogs(network);
            setBluetoothLogs(bluetooth);
            setStorageLogs(storage);
            setDeviceEvents(events);
            setEmployeeScreenTime(byEmployee);
        } catch (error) {
            console.error('Error loading device monitoring data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    // Real-time subscription
    useEffect(() => {
        const unsubscribe = subscribeToMonitoringUpdates((payload) => {
            console.log("Real-time update received:", payload);
            // Throttle or debounce if many updates come in
            loadData();
        });

        return () => {
            unsubscribe();
        };
    }, [loadData]);

    // Calculate device status based on latest event
    const getDeviceStatus = () => {
        if (deviceEvents.length === 0) return { status: 'offline', label: 'Device Offline', color: 'bg-red-500', lastSync: 'No recent data' };

        const latestEvent = deviceEvents[0];
        const lastEventTime = new Date(latestEvent.event_time).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - lastEventTime) / (1000 * 60);

        // Format last sync time (e.g. "2m ago")
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const lastSyncLabel = diffMinutes < 1
            ? 'just now'
            : diffMinutes < 60
                ? rtf.format(-Math.round(diffMinutes), 'minute')
                : rtf.format(-Math.round(diffMinutes / 60), 'hour');

        if (diffMinutes > 15) { // Offline if no event for 15 mins (missed heartbeat)
            return { status: 'offline', label: 'Device Offline', color: 'bg-red-500', lastSync: `Last seen ${lastSyncLabel}` };
        }

        if (latestEvent.event_type === 'screen_on' || latestEvent.event_type === 'unlock' || latestEvent.event_type === 'boot') {
            return { status: 'online', label: 'Device Online', color: 'bg-green-500', lastSync: 'Active now' };
        }

        return { status: 'idle', label: 'Device Idle', color: 'bg-yellow-500', lastSync: `Idle since ${lastSyncLabel}` };
    };

    const deviceStatus = getDeviceStatus();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Monitor className="h-6 w-6 text-primary" />
                            Device Monitoring
                        </h1>
                        <div className="flex items-center gap-2 px-3 py-1 bg-background/50 border rounded-full text-xs shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${deviceStatus.color} ${deviceStatus.status === 'online' ? 'animate-pulse' : ''}`} />
                            <span className="font-medium">{deviceStatus.label}</span>
                            <span className="text-muted-foreground border-l pl-2 ml-1">{deviceStatus.lastSync}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Monitor screen time, app usage, network activity, and connected devices
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Today
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-7 gap-2 h-auto p-1">
                    <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
                        <Monitor className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="screen-time" className="flex items-center gap-2 py-2">
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Screen Time</span>
                    </TabsTrigger>
                    <TabsTrigger value="apps" className="flex items-center gap-2 py-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="hidden sm:inline">App Usage</span>
                    </TabsTrigger>
                    <TabsTrigger value="network" className="flex items-center gap-2 py-2">
                        <Wifi className="h-4 w-4" />
                        <span className="hidden sm:inline">Network</span>
                    </TabsTrigger>
                    <TabsTrigger value="storage" className="flex items-center gap-2 py-2">
                        <HardDrive className="h-4 w-4" />
                        <span className="hidden sm:inline">Storage</span>
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-2 py-2">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Events</span>
                    </TabsTrigger>
                    <TabsTrigger value="bluetooth" className="flex items-center gap-2 py-2">
                        <Bluetooth className="h-4 w-4" />
                        <span className="hidden sm:inline">Bluetooth</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Active Devices"
                            value={summary?.screenTime.activeDevices.toString() || "0"}
                            icon={<Users className="h-4 w-4" />}
                            description="Devices reporting today"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Recent Events"
                            value={deviceEvents.length.toString()}
                            icon={<Zap className="h-4 w-4" />}
                            description="Device events today"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Data Used Today"
                            value={summary ? formatBytes(summary.networkUsage.wifi + summary.networkUsage.mobile) : "0 MB"}
                            icon={<Activity className="h-4 w-4" />}
                            description="WiFi + Mobile Data"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Avg Storage Used"
                            value={summary?.storageUsage ? `${Math.round((summary.storageUsage.used_bytes / summary.storageUsage.total_bytes) * 100)}%` : "N/A"}
                            icon={<HardDrive className="h-4 w-4" />}
                            description="Device storage utilization"
                            loading={isLoading}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    Category Breakdown
                                </CardTitle>
                                <CardDescription>
                                    App usage by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                                        ))}
                                    </div>
                                ) : summary && summary.categoryBreakdown.length > 0 ? (
                                    <div className="space-y-4">
                                        {summary.categoryBreakdown.slice(0, 6).map(cat => (
                                            <CategoryBar
                                                key={cat.category}
                                                category={cat.category}
                                                minutes={cat.totalMinutes}
                                                percentage={cat.percentage}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Monitor className="h-8 w-8 text-muted-foreground" />}
                                        title="No Data Yet"
                                        description="Category breakdown will appear here once mobile devices start reporting."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-primary" />
                                    Top Apps
                                </CardTitle>
                                <CardDescription>
                                    Most used applications today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                                        ))}
                                    </div>
                                ) : summary && summary.topApps.length > 0 ? (
                                    <div className="divide-y">
                                        {summary.topApps.slice(0, 5).map(app => (
                                            <AppUsageItem key={app.packageName} app={app} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Smartphone className="h-8 w-8 text-muted-foreground" />}
                                        title="No App Data"
                                        description="App usage statistics will be displayed here once devices sync their usage data."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Screen Time Tab */}
                <TabsContent value="screen-time" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Total Screen Time"
                            value={summary ? formatMinutes(summary.screenTime.totalMinutes) : "0h 0m"}
                            icon={<Clock className="h-4 w-4" />}
                            description="All devices combined"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Unlock Count"
                            value={summary?.screenTime.totalUnlocks.toString() || "0"}
                            icon={<Smartphone className="h-4 w-4" />}
                            description="Total unlocks today"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Active Employees"
                            value={employeeScreenTime.length.toString()}
                            icon={<Users className="h-4 w-4" />}
                            description="With screen time data"
                            loading={isLoading}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Screen Time by Employee</CardTitle>
                            <CardDescription>Daily screen time breakdown per employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : employeeScreenTime.length > 0 ? (
                                <div className="divide-y">
                                    {employeeScreenTime.map((emp) => (
                                        <div key={emp.employeeCode} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{emp.employeeCode}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {emp.devices} device{emp.devices > 1 ? 's' : ''} • {emp.unlockCount} unlocks
                                                </p>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{formatMinutes(emp.totalMinutes)}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openNotificationDialog(emp.employeeCode)}
                                                >
                                                    <Zap className="h-4 w-4 mr-2" />
                                                    Alert
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Clock className="h-8 w-8 text-muted-foreground" />}
                                    title="No Screen Time Data"
                                    description="Screen time data will appear here once mobile devices start syncing."
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Notification Dialog */}
                    <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Send Alert to {selectedEmployee}</DialogTitle>
                                <DialogDescription>
                                    This will send a push notification to all logged-in devices for this employee.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select
                                        value={notificationType}
                                        onValueChange={(value: any) => setNotificationType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reminder">Reminder</SelectItem>
                                            <SelectItem value="alert">Alert</SelectItem>
                                            <SelectItem value="broadcast">Broadcast</SelectItem>
                                            <SelectItem value="policy">Policy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <input
                                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter title"
                                        value={notificationTitle}
                                        onChange={(e) => setNotificationTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message Body</label>
                                    <Textarea
                                        placeholder="Enter your message here..."
                                        value={notificationBody}
                                        onChange={(e) => setNotificationBody(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsNotificationDialogOpen(false)}
                                    disabled={isSendingNotification}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendNotification}
                                    disabled={isSendingNotification}
                                >
                                    {isSendingNotification ? "Sending..." : "Send Notification"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* App Usage Tab */}
                <TabsContent value="apps" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        {['productivity', 'social', 'entertainment', 'other'].map(category => {
                            const minutes = summary?.categoryBreakdown.find(c => c.category === category)?.totalMinutes || 0;
                            return (
                                <StatCard
                                    key={category}
                                    title={category.charAt(0).toUpperCase() + category.slice(1) + ' Apps'}
                                    value={formatMinutes(minutes)}
                                    icon={<Activity className="h-4 w-4" />}
                                    loading={isLoading}
                                />
                            );
                        })}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All App Usage</CardTitle>
                            <CardDescription>Time spent in each application</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : summary && summary.topApps.length > 0 ? (
                                <div className="divide-y">
                                    {summary.topApps.map(app => (
                                        <AppUsageItem key={app.packageName} app={app} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Smartphone className="h-8 w-8 text-muted-foreground" />}
                                    title="No App Usage Data"
                                    description="App usage statistics will appear here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Network Tab */}
                <TabsContent value="network" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="WiFi Data"
                            value={summary ? formatBytes(summary.networkUsage.wifi) : "0 MB"}
                            icon={<Wifi className="h-4 w-4" />}
                            description="Total WiFi usage"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Mobile Data"
                            value={summary ? formatBytes(summary.networkUsage.mobile) : "0 MB"}
                            icon={<Activity className="h-4 w-4" />}
                            description="Total mobile data"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Networks"
                            value={new Set(networkLogs.map(n => n.network_name).filter(Boolean)).size.toString()}
                            icon={<Wifi className="h-4 w-4" />}
                            description="Unique networks connected"
                            loading={isLoading}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Network Activity</CardTitle>
                            <CardDescription>WiFi and mobile data usage logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : networkLogs.length > 0 ? (
                                <div className="divide-y">
                                    {networkLogs.slice(0, 20).map((log) => (
                                        <div key={log.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {log.connection_type === 'wifi' ? (
                                                    <Wifi className="h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <Activity className="h-5 w-5 text-orange-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {log.network_name || (log.connection_type === 'wifi' ? 'WiFi' : 'Mobile Data')}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{log.employee_code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatBytes(log.bytes_received + log.bytes_sent)}</p>
                                                <p className="text-xs text-muted-foreground">{log.log_date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Wifi className="h-8 w-8 text-muted-foreground" />}
                                    title="No Network Data"
                                    description="Network usage data will appear here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Storage Tab */}
                <TabsContent value="storage" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Avg Storage Used"
                            value={summary?.storageUsage ? formatBytes(summary.storageUsage.used_bytes) : "0 B"}
                            icon={<HardDrive className="h-4 w-4" />}
                            description="Average used space"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Avg Free Space"
                            value={summary?.storageUsage ? formatBytes(summary.storageUsage.free_bytes) : "0 B"}
                            icon={<HardDrive className="h-4 w-4" />}
                            description="Average available space"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Total Capacity"
                            value={summary?.storageUsage ? formatBytes(summary.storageUsage.total_bytes) : "0 B"}
                            icon={<HardDrive className="h-4 w-4" />}
                            description="Average total capacity"
                            loading={isLoading}
                        />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Status</CardTitle>
                            <CardDescription>Device storage utilization logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : storageLogs.length > 0 ? (
                                <div className="divide-y">
                                    {storageLogs.slice(0, 20).map((log) => (
                                        <div key={log.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <HardDrive className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">Storage Check</p>
                                                    <p className="text-sm text-muted-foreground">{log.employee_code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-sm">
                                                    {formatBytes(log.used_bytes)} / {formatBytes(log.total_bytes)}
                                                </p>
                                                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 ml-auto overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{ width: `${(log.used_bytes / log.total_bytes) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{log.log_date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<HardDrive className="h-8 w-8 text-muted-foreground" />}
                                    title="No Storage Data"
                                    description="Storage usage data will appear here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Events</CardTitle>
                            <CardDescription>Recent system events (Screen On/Off, Shutdown, etc.)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : deviceEvents.length > 0 ? (
                                <div className="divide-y">
                                    {deviceEvents.map((event) => (
                                        <div key={event.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    event.event_type.includes('ON') ? "bg-green-100 text-green-600" :
                                                        event.event_type.includes('OFF') ? "bg-red-100 text-red-600" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    <Power className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">{event.employee_code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {new Date(event.event_time).toLocaleTimeString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(event.event_time).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<List className="h-8 w-8 text-muted-foreground" />}
                                    title="No Events"
                                    description="Device events will appear here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bluetooth Tab */}
                <TabsContent value="bluetooth" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Connected Devices"
                            value={summary?.bluetoothDevices.toString() || "0"}
                            icon={<Bluetooth className="h-4 w-4" />}
                            description="Unique devices today"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Connection Events"
                            value={bluetoothLogs.length.toString()}
                            icon={<Activity className="h-4 w-4" />}
                            description="Today's connections"
                            loading={isLoading}
                        />
                        <StatCard
                            title="Device Types"
                            value={new Set(bluetoothLogs.map(b => b.device_type).filter(Boolean)).size.toString()}
                            icon={<Monitor className="h-4 w-4" />}
                            description="Unique device types"
                            loading={isLoading}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bluetooth Devices</CardTitle>
                            <CardDescription>Connected bluetooth devices and connection history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : bluetoothLogs.length > 0 ? (
                                <div className="divide-y">
                                    {bluetoothLogs.slice(0, 20).map((log) => (
                                        <div key={log.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Bluetooth className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium">{log.device_name}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {log.device_type || 'unknown'} • {log.employee_code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{log.connection_count}x</p>
                                                <p className="text-xs text-muted-foreground">{log.log_date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Bluetooth className="h-8 w-8 text-muted-foreground" />}
                                    title="No Bluetooth Data"
                                    description="Bluetooth device connections will appear here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
