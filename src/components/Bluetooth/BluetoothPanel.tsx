import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bluetooth, Headphones, Keyboard, Mouse, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { BluetoothLog, DeviceEvent } from "@/services/deviceMonitoringService";

type BluetoothDevice = {
  name: string;
  type?: string | null;
  mac?: string | null;
  lastSeen?: string;
  connected?: boolean;
  batteryLevel?: number | null;
};

type BluetoothSummary = {
  bluetoothDevices: number;
} | null;

type BluetoothScanDevice = {
  name?: string;
  type?: string;
  address?: string;
  mac?: string;
  connected?: boolean;
  battery?: number;
  battery_level?: number;
};

type BluetoothScanMetadata = {
  devices?: BluetoothScanDevice[];
  enabled?: boolean;
  scanning?: boolean;
};

interface BluetoothPanelProps {
  summary: BluetoothSummary;
  bluetoothLogs: BluetoothLog[];
  deviceEvents: DeviceEvent[];
  isLoading: boolean;
}

function getLatestBluetoothScan(deviceEvents: DeviceEvent[]): DeviceEvent | undefined {
  return deviceEvents.find((event) => event.event_type === "bluetooth_scan");
}

function getBluetoothEnabled(latestScan?: DeviceEvent): boolean {
  const metadata = latestScan?.metadata as BluetoothScanMetadata | undefined;
  return metadata?.enabled ?? true;
}

function normalizeBluetoothDevices(latestScan?: DeviceEvent, bluetoothLogs: BluetoothLog[] = []): BluetoothDevice[] {
  const metadata = latestScan?.metadata as BluetoothScanMetadata | undefined;
  if (metadata?.devices?.length) {
    return metadata.devices.map((device) => ({
      name: device.name || "Unknown Device",
      type: device.type,
      mac: device.address || device.mac,
      connected: device.connected ?? true,
      lastSeen: latestScan.event_time,
      batteryLevel: device.battery ?? device.battery_level ?? null,
    }));
  }

  const deviceMap = new Map<string, BluetoothDevice>();
  bluetoothLogs.forEach((log) => {
    const key = log.device_name || log.device_mac || `${log.id}`;
    const existing = deviceMap.get(key);
    if (!existing) {
      deviceMap.set(key, {
        name: log.device_name || "Unknown Device",
        type: log.device_type,
        mac: log.device_mac,
        lastSeen: log.log_date,
        connected: log.connection_count > 0,
        batteryLevel: null,
      });
    } else if (log.log_date > (existing.lastSeen || "")) {
      existing.lastSeen = log.log_date;
      existing.connected = log.connection_count > 0;
    }
  });

  return Array.from(deviceMap.values());
}

function getDeviceIcon(type?: string | null) {
  if (!type) return Bluetooth;
  const lower = type.toLowerCase();
  if (lower.includes("headphone") || lower.includes("audio")) return Headphones;
  if (lower.includes("keyboard")) return Keyboard;
  if (lower.includes("mouse")) return Mouse;
  if (lower.includes("phone") || lower.includes("mobile")) return Smartphone;
  return Bluetooth;
}

function formatMac(mac?: string | null): string {
  if (!mac) return "--";
  return mac.replace(/(.{2})/g, "$1:").slice(0, 17).toUpperCase();
}

export function BluetoothPanel({ summary, bluetoothLogs, deviceEvents, isLoading }: BluetoothPanelProps) {
  const latestScan = getLatestBluetoothScan(deviceEvents);
  const isEnabled = getBluetoothEnabled(latestScan);
  const devices = normalizeBluetoothDevices(latestScan, bluetoothLogs);
  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 15;
  const filteredHistory = useMemo(() => {
    if (!historySearch) return bluetoothLogs;
    const needle = historySearch.toLowerCase();
    return bluetoothLogs.filter((log) => {
      return `${log.device_name} ${log.device_type} ${log.device_mac || ""}`.toLowerCase().includes(needle);
    });
  }, [bluetoothLogs, historySearch]);
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
  const historySlice = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return filteredHistory.slice(start, start + historyPageSize);
  }, [filteredHistory, historyPage, historyPageSize]);
  const latestScanMetadata = latestScan?.metadata as BluetoothScanMetadata | undefined;
  const scanStatus = latestScanMetadata?.scanning ? "Scanning" : "Idle";

  useEffect(() => {
    setHistoryPage(1);
  }, [bluetoothLogs.length, historySearch]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bluetooth className="h-5 w-5 text-primary" />
                Bluetooth Status
              </CardTitle>
              <CardDescription>Adapter status and device visibility</CardDescription>
            </div>
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2",
                isEnabled ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", isEnabled ? "bg-blue-600" : "bg-red-600")} />
              Bluetooth {isEnabled ? "On" : "Off"}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Connected Devices</span>
                <p className="font-semibold">{devices.filter((d) => d.connected).length}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Devices</span>
                <p className="font-semibold">{summary?.bluetoothDevices ?? devices.length}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last scan: {latestScan ? new Date(latestScan.event_time).toLocaleTimeString() : "--"}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full",
                scanStatus === "Scanning" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
              )}>
                {scanStatus}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
            <CardDescription>Active peripherals and paired devices</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : devices.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {devices.map((device) => {
                  const Icon = getDeviceIcon(device.type);
                  return (
                    <div key={`${device.name}-${device.mac}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{device.name}</p>
                          {device.connected ? (
                            <Badge variant="secondary">Connected</Badge>
                          ) : (
                            <Badge variant="outline">Paired</Badge>
                          )}
                          {device.batteryLevel !== null && device.batteryLevel !== undefined && (
                            <Badge variant="outline">{device.batteryLevel}%</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{device.type || "Unknown Type"}</p>
                        <p className="text-[11px] text-muted-foreground">{formatMac(device.mac)}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : "--"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Bluetooth className="h-8 w-8 mb-2 opacity-50" />
                <p>No Bluetooth devices detected.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Bluetooth History</CardTitle>
            <CardDescription>Pairing and connection events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pb-4">
              <Input
                placeholder="Search device name, type, MAC"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                className="md:w-[260px]"
              />
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead className="w-[160px]">Type</TableHead>
                      <TableHead className="text-right w-[140px]">Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historySlice.map((log) => (
                  <TableRow
                    key={log.id}
                    className={cn(
                      log.connection_count > 0 ? "bg-blue-50/40" : ""
                    )}
                  >
                    <TableCell className="font-mono text-xs">
                      {new Date(log.log_date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.device_name || "Unknown Device"}</p>
                        <p className="text-xs text-muted-foreground">{formatMac(log.device_mac)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{log.device_type || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={log.connection_count > 0 ? "secondary" : "outline"}>
                        {log.connection_count > 0 ? "Connected" : "Detected"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page {historyPage} of {historyTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={historyPage === 1}
                    className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryPage((prev) => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyPage >= historyTotalPages}
                    className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Bluetooth className="h-8 w-8 mb-2 opacity-50" />
              <p>No Bluetooth history available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
