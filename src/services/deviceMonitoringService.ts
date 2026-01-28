import { supabase } from "@/lib/supabase";
import { buildRealtimeEventKey, createEventDeduper } from "@/utils/realtime";

// Types for device monitoring data
export interface ScreenTimeLog {
    id: number;
    employee_code: string;
    device_id: string;
    log_date: string;
    total_screen_time_minutes: number;
    unlock_count: number;
    first_unlock: string | null;
    last_lock: string | null;
    created_at: string;
}

export interface AppUsageLog {
    id: number;
    employee_code: string;
    device_id: string;
    log_date: string;
    package_name: string;
    app_name: string;
    category: string | null;
    foreground_time_minutes: number;
    launch_count: number;
    created_at: string;
}

export interface NetworkLog {
    id: number;
    employee_code: string;
    device_id: string;
    log_date: string;
    connection_type: 'wifi' | 'mobile_data';
    network_name: string | null;
    bytes_sent: number;
    bytes_received: number;
    wifi_rx_bytes: number;
    wifi_tx_bytes: number;
    mobile_rx_bytes: number;
    mobile_tx_bytes: number;
    created_at: string;
}

export interface StorageLog {
    id: number;
    employee_code: string;
    device_id: string;
    log_date: string;
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
    created_at: string;
}

export interface DeviceEvent {
    id: number;
    employee_code: string;
    device_id: string;
    event_type: string;
    event_time: string;
    metadata: any;
    created_at: string;
}

export interface BluetoothLog {
    id: number;
    employee_code: string;
    device_id: string;
    log_date: string;
    device_name: string;
    device_mac: string | null;
    device_type: string | null;
    connection_count: number;
    total_connected_minutes: number;
    created_at: string;
}

export interface DeviceNotification {
    id: number;
    employee_code: string;
    device_id: string | null;
    title: string;
    body: string;
    notification_type: 'reminder' | 'alert' | 'broadcast' | 'policy';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    sent_by: string | null;
    sent_at: string;
    delivered_at: string | null;
    read_at: string | null;
    acknowledged_at: string | null;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'acknowledged' | 'failed';
}

// Summary types
export interface ScreenTimeSummary {
    totalMinutes: number;
    totalUnlocks: number;
    averageMinutes: number;
    activeDevices: number;
}

export interface AppUsageSummary {
    appName: string;
    category: string;
    totalMinutes: number;
    packageName: string;
}

export interface CategorySummary {
    category: string;
    totalMinutes: number;
    percentage: number;
}

// Get today's date in YYYY-MM-DD format (using LOCAL timezone to match mobile app)
const getTodayDate = () => {
    const now = new Date();
    // Use local date components instead of toISOString() which uses UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get date N days ago
const getDateDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

/**
 * Fetch screen time logs for a date range
 */
export async function fetchScreenTimeLogs(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<ScreenTimeLog[]> {
    try {
        let query = supabase
            .from('screen_time_logs')
            .select('*')
            .order('log_date', { ascending: false });

        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching screen time logs:', error);
        return [];
    }
}

/**
 * Fetch app usage logs for a date range
 */
export async function fetchAppUsageLogs(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<AppUsageLog[]> {
    try {
        let query = supabase
            .from('app_usage_logs')
            .select('*')
            .order('foreground_time_minutes', { ascending: false });

        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching app usage logs:', error);
        return [];
    }
}

/**
 * Fetch network logs for a date range
 */
export async function fetchNetworkLogs(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<NetworkLog[]> {
    try {
        let query = supabase
            .from('network_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching network logs:', error);
        return [];
    }
}

/**
 * Fetch bluetooth logs for a date range
 */
export async function fetchBluetoothLogs(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<BluetoothLog[]> {
    try {
        let query = supabase
            .from('bluetooth_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching bluetooth logs:', error);
        return [];
    }
}

/**
 * Fetch storage logs for a date range
 */
export async function fetchStorageLogs(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<StorageLog[]> {
    try {
        let query = supabase
            .from('storage_logs')
            .select('*')
            .order('log_date', { ascending: false });

        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching storage logs:', error);
        return [];
    }
}

/**
 * Fetch device events for a date range
 */
export async function fetchDeviceEvents(
    startDate?: string,
    endDate?: string,
    employeeCode?: string
): Promise<DeviceEvent[]> {
    try {
        let query = supabase
            .from('device_events')
            .select('*')
            .order('event_time', { ascending: false });

        if (startDate) {
            query = query.gte('event_time', `${startDate}T00:00:00`);
        }
        if (employeeCode) {
            query = query.eq('employee_code', employeeCode);
        }

        query = query.limit(500);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching device events:', error);
        return [];
    }
}

/**
 * Get daily overview summary (default to today)
 */
export async function fetchDailySummary(dateStr?: string): Promise<{
    screenTime: ScreenTimeSummary;
    topApps: AppUsageSummary[];
    categoryBreakdown: CategorySummary[];
    networkUsage: { wifi: number; mobile: number; wifiTx: number; wifiRx: number; mobileTx: number; mobileRx: number };
    bluetoothDevices: number;
    storageUsage?: StorageLog;
}> {
    const targetDate = dateStr || getTodayDate();

    try {
        // Fetch all data in parallel
        const [screenTime, appUsage, network, bluetooth, storageLogs] = await Promise.all([
            fetchScreenTimeLogs(targetDate, targetDate),
            fetchAppUsageLogs(targetDate, targetDate),
            fetchNetworkLogs(targetDate, targetDate),
            fetchBluetoothLogs(targetDate, targetDate),
            fetchStorageLogs(targetDate, targetDate),
        ]);

        // Calculate screen time summary
        const totalMinutes = screenTime.reduce((sum, log) => sum + log.total_screen_time_minutes, 0);
        const totalUnlocks = screenTime.reduce((sum, log) => sum + log.unlock_count, 0);
        const activeDevices = new Set(screenTime.map(log => log.device_id)).size;

        // Aggregate app usage by app
        const appMap = new Map<string, AppUsageSummary>();
        for (const log of appUsage) {
            const key = log.package_name;
            const existing = appMap.get(key);
            if (existing) {
                existing.totalMinutes += log.foreground_time_minutes;
            } else {
                appMap.set(key, {
                    appName: log.app_name,
                    category: log.category || 'other',
                    totalMinutes: log.foreground_time_minutes,
                    packageName: log.package_name,
                });
            }
        }
        const topApps = Array.from(appMap.values())
            .sort((a, b) => b.totalMinutes - a.totalMinutes)
            .slice(0, 10);

        // Calculate category breakdown
        const categoryMap = new Map<string, number>();
        for (const log of appUsage) {
            const category = log.category || 'other';
            categoryMap.set(category, (categoryMap.get(category) || 0) + log.foreground_time_minutes);
        }
        const totalCategoryMinutes = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
        const categoryBreakdown = Array.from(categoryMap.entries())
            .map(([category, minutes]) => ({
                category,
                totalMinutes: minutes,
                percentage: totalCategoryMinutes > 0 ? Math.round((minutes / totalCategoryMinutes) * 100) : 0,
            }))
            .sort((a, b) => b.totalMinutes - a.totalMinutes);

        // Calculate network usage
        // Note: wifi_rx_bytes etc are daily totals/deltas from the logs. 
        // If multiple logs exist for today (e.g. per device), we sum them.
        const wifiBytes = network
            .filter(log => log.connection_type === 'wifi')
            .reduce((sum, log) => sum + (log.wifi_rx_bytes + log.wifi_tx_bytes || log.bytes_received + log.bytes_sent), 0);

        const mobileBytes = network
            .filter(log => log.connection_type === 'mobile_data')
            .reduce((sum, log) => sum + (log.mobile_rx_bytes + log.mobile_tx_bytes || log.bytes_received + log.bytes_sent), 0);

        const wifiTx = network.filter(l => l.connection_type === 'wifi')
            .reduce((s, l) => s + (l.wifi_tx_bytes || 0), 0);
        const wifiRx = network.filter(l => l.connection_type === 'wifi')
            .reduce((s, l) => s + (l.wifi_rx_bytes || 0), 0);
        const mobileTx = network.filter(l => l.connection_type === 'mobile_data')
            .reduce((s, l) => s + (l.mobile_tx_bytes || 0), 0);
        const mobileRx = network.filter(l => l.connection_type === 'mobile_data')
            .reduce((s, l) => s + (l.mobile_rx_bytes || 0), 0);

        // Count unique bluetooth devices
        const bluetoothDevices = new Set(bluetooth.map(log => log.device_name)).size;

        // Storage usage
        const storageUsage = storageLogs.length > 0 ? storageLogs[0] : undefined;

        return {
            screenTime: {
                totalMinutes,
                totalUnlocks,
                averageMinutes: activeDevices > 0 ? Math.round(totalMinutes / activeDevices) : 0,
                activeDevices,
            },
            topApps,
            categoryBreakdown,
            networkUsage: {
                wifi: wifiBytes,
                mobile: mobileBytes,
                wifiTx,
                wifiRx,
                mobileTx,
                mobileRx
            },
            bluetoothDevices,
            storageUsage,
        };
    } catch (error) {
        console.error('Error fetching today summary:', error);
        return {
            screenTime: { totalMinutes: 0, totalUnlocks: 0, averageMinutes: 0, activeDevices: 0 },
            topApps: [],
            categoryBreakdown: [],
            networkUsage: { wifi: 0, mobile: 0, wifiTx: 0, wifiRx: 0, mobileTx: 0, mobileRx: 0 },
            bluetoothDevices: 0,
        };
    }
}

/**
 * Fetch screen time by employee for the dashboard table
 */
export async function fetchScreenTimeByEmployee(
    date?: string
): Promise<Array<{ employeeCode: string; totalMinutes: number; unlockCount: number; devices: number }>> {
    const targetDate = date || getTodayDate();

    try {
        const { data, error } = await supabase
            .from('screen_time_logs')
            .select('employee_code, device_id, total_screen_time_minutes, unlock_count')
            .eq('log_date', targetDate);

        if (error) throw error;

        // Group by employee
        const employeeMap = new Map<string, { totalMinutes: number; unlockCount: number; devices: Set<string> }>();
        for (const log of data || []) {
            const existing = employeeMap.get(log.employee_code);
            if (existing) {
                existing.totalMinutes += log.total_screen_time_minutes;
                existing.unlockCount += log.unlock_count;
                existing.devices.add(log.device_id);
            } else {
                employeeMap.set(log.employee_code, {
                    totalMinutes: log.total_screen_time_minutes,
                    unlockCount: log.unlock_count,
                    devices: new Set([log.device_id]),
                });
            }
        }

        return Array.from(employeeMap.entries()).map(([employeeCode, data]) => ({
            employeeCode,
            totalMinutes: data.totalMinutes,
            unlockCount: data.unlockCount,
            devices: data.devices.size,
        }));
    } catch (error) {
        console.error('Error fetching screen time by employee:', error);
        return [];
    }
}



/**
 * Fetch screen time history (daily totals) for the last 7 days
 */
export async function fetchScreenTimeHistory(days: number = 7): Promise<Array<{ date: string; totalMinutes: number; unlockCount: number }>> {
    const endDate = getTodayDate();
    const startDate = getDateDaysAgo(days);

    try {
        // We fetch logs for the range
        const logs = await fetchScreenTimeLogs(startDate, endDate);

        // Aggregate by date
        const dateMap = new Map<string, { totalMinutes: number; unlockCount: number }>();

        // Initialize all dates in range with 0 (fill gaps)
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            dateMap.set(dateStr, { totalMinutes: 0, unlockCount: 0 });
        }

        for (const log of logs) {
            // log.log_date should be YYYY-MM-DD string
            // Normalize just in case
            const dateStr = log.log_date.split('T')[0];
            const existing = dateMap.get(dateStr);
            if (existing) {
                existing.totalMinutes += log.total_screen_time_minutes;
                existing.unlockCount += log.unlock_count;
            }
        }

        // Convert to array and sort by date ascending
        return Array.from(dateMap.entries())
            .map(([date, data]) => ({
                date,
                totalMinutes: data.totalMinutes,
                unlockCount: data.unlockCount
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
        console.error('Error fetching screen time history:', error);
        return [];
    }
}

/**
 * Send a notification to a device
 */
export async function sendDeviceNotification(
    employeeCode: string,
    title: string,
    body: string,
    type: DeviceNotification['notification_type'] = 'alert',
    priority: DeviceNotification['priority'] = 'normal',
    deviceId?: string
): Promise<boolean> {
    try {
        const { error } = await supabase.from('device_notifications').insert({
            employee_code: employeeCode,
            device_id: deviceId,
            title,
            body,
            notification_type: type,
            priority,
            status: 'pending',
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format minutes to human readable string
 */
export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

/**
 * Get category color for UI
 */
export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        productivity: '#22c55e',
        social: '#3b82f6',
        entertainment: '#a855f7',
        communication: '#f97316',
        utility: '#14b8a6',
        other: '#6b7280',
    };
    return colors[category.toLowerCase()] || colors.other;
}

/**
 * Subscribe to real-time updates for all monitoring tables
 */
/**
 * Subscribe to real-time updates with robust error handling and auto-reconnection
 */
export function subscribeToMonitoringUpdates(
    callback: (payload: any) => void,
    statusCallback?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR' | 'CONNECTING') => void
) {
    let retryCount = 0;
    const MAX_RETRIES = 5;
    let retryTimeout: NodeJS.Timeout | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isCleanedUp = false;
    const shouldProcess = createEventDeduper();

    function emit(payload: any): void {
        const key = buildRealtimeEventKey(payload, true);
        if (!shouldProcess(key)) return;
        callback(payload);
    }

    const setupSubscription = () => {
        if (isCleanedUp) return;

        if (statusCallback) statusCallback('CONNECTING');

        // Clean up previous channel if exists
        if (channel) {
            supabase.removeChannel(channel);
        }

        channel = supabase
            .channel('device_monitoring_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'screen_time_logs' },
                emit
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'app_usage_logs' },
                emit
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'network_logs' },
                emit
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bluetooth_logs' },
                emit
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'storage_logs' },
                emit
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'device_events' },
                emit
            )
            .subscribe((status) => {
                console.log('Realtime Subscription Status:', status);
                if (statusCallback) statusCallback(status as any);

                if (status === 'SUBSCRIBED') {
                    retryCount = 0; // Reset retries on success
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    if (retryCount < MAX_RETRIES) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
                        console.log(`Subscription error (${status}). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                        retryCount++;
                        retryTimeout = setTimeout(setupSubscription, delay);
                    } else {
                        console.error('Max retries reached for realtime subscription.');
                    }
                }
            });
    };

    // Initial connection
    setupSubscription();

    // Cleanup function
    return () => {
        isCleanedUp = true;
        if (retryTimeout) clearTimeout(retryTimeout);
        if (channel) supabase.removeChannel(channel);
        console.log('Realtime subscription cleaned up');
    };
}
