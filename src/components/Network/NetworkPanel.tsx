import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusCard } from "@/components/Shared/StatusCard";
import { DataUsageBar } from "@/components/Shared/DataUsageBar";
import { SignalIndicator } from "@/components/Shared/SignalIndicator";
import { formatBytes, type DeviceEvent, type NetworkLog } from "@/services/deviceMonitoringService";
import { Wifi, Activity, Network, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type NetworkSummary = {
  networkUsage: { wifi: number; mobile: number };
} | null;

interface NetworkPanelProps {
  summary: NetworkSummary;
  networkLogs: NetworkLog[];
  deviceEvents: DeviceEvent[];
  isLoading: boolean;
}

function getLatestWifiEvent(deviceEvents: DeviceEvent[]): DeviceEvent | undefined {
  return deviceEvents.find((event) => {
    if (event.event_type === "wifi_scan") return true;
    if (event.event_type === "network_change") return true;
    return event.metadata?.type === "wifi";
  });
}

function getWifiConnectionState(event?: DeviceEvent): { connected: boolean; ssid?: string } {
  if (!event) return { connected: false };
  const connected = event.metadata?.connected === true || event.metadata?.status === "connected";
  return { connected, ssid: event.metadata?.ssid };
}

function mapSignalStrength(rssi?: number): number {
  if (rssi === undefined || rssi === null) return 0;
  const normalized = (rssi + 100) * 2;
  return Math.max(0, Math.min(100, normalized));
}

function summarizeUsage(networkLogs: NetworkLog[]) {
  return networkLogs.reduce(
    (totals, log) => {
      const wifiRx = log.wifi_rx_bytes || (log.connection_type === "wifi" ? log.bytes_received : 0);
      const wifiTx = log.wifi_tx_bytes || (log.connection_type === "wifi" ? log.bytes_sent : 0);
      const mobileRx = log.mobile_rx_bytes || (log.connection_type === "mobile_data" ? log.bytes_received : 0);
      const mobileTx = log.mobile_tx_bytes || (log.connection_type === "mobile_data" ? log.bytes_sent : 0);

      return {
        wifiRx: totals.wifiRx + wifiRx,
        wifiTx: totals.wifiTx + wifiTx,
        mobileRx: totals.mobileRx + mobileRx,
        mobileTx: totals.mobileTx + mobileTx,
      };
    },
    { wifiRx: 0, wifiTx: 0, mobileRx: 0, mobileTx: 0 }
  );
}

export function NetworkPanel({ summary, networkLogs, deviceEvents, isLoading }: NetworkPanelProps) {
  const [connectionType, setConnectionType] = useState<"all" | "wifi" | "mobile_data">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const latestWifiEvent = getLatestWifiEvent(deviceEvents);
  const { connected, ssid } = getWifiConnectionState(latestWifiEvent);
  const rssi = latestWifiEvent?.metadata?.rssi;
  const linkSpeed = latestWifiEvent?.metadata?.link_speed;
  const ipAddress = latestWifiEvent?.metadata?.ip;
  const signalStrength = mapSignalStrength(rssi);

  const usage = summarizeUsage(networkLogs);
  const wifiTotal = usage.wifiRx + usage.wifiTx;
  const mobileTotal = usage.mobileRx + usage.mobileTx;
  const totalUsage = wifiTotal + mobileTotal;

  const filteredLogs = useMemo(() => {
    const filtered = networkLogs.filter((log) => {
      if (connectionType !== "all" && log.connection_type !== connectionType) return false;
      if (startDate && new Date(log.log_date) < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && new Date(log.log_date) > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const aTime = new Date(a.log_date).getTime();
      const bTime = new Date(b.log_date).getTime();
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });
  }, [networkLogs, connectionType, startDate, endDate, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [connectionType, startDate, endDate, sortOrder]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Current Network
              </CardTitle>
              <CardDescription>Live connection and signal status</CardDescription>
            </div>
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2",
                connected ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-green-600" : "bg-muted-foreground"
                )}
              />
              Wi-Fi {connected ? "Connected" : "Disconnected"}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_160px]">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Network</p>
                  <p className="text-lg font-semibold truncate">{ssid || "Unknown SSID"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">IP Address</span>
                    <p className="font-medium">{ipAddress || "--"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Link Speed</span>
                    <p className="font-medium">{linkSpeed ? `${linkSpeed} Mbps` : "--"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SignalIndicator type="wifi" strength={signalStrength} />
                  <span className="text-xs text-muted-foreground">{rssi ? `${rssi} dBm` : "Signal unavailable"}</span>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Network className="h-4 w-4" />
                  <span className="font-semibold">Status</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Updated</span>
                    <span className="font-medium text-foreground">
                      {latestWifiEvent ? new Date(latestWifiEvent.event_time).toLocaleTimeString() : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connection</span>
                    <span className="font-medium text-foreground">{connected ? "Online" : "Offline"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Usage</CardTitle>
            <CardDescription>Daily network usage breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <StatusCard
                title="Total"
                value={formatBytes(totalUsage)}
                icon={Activity}
                description="All network traffic"
              />
              <StatusCard
                title="Wi-Fi"
                value={formatBytes(wifiTotal)}
                icon={Wifi}
                description="Wi-Fi traffic"
              />
              <StatusCard
                title="Mobile"
                value={formatBytes(mobileTotal)}
                icon={Activity}
                description="Mobile data"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span>Wi-Fi Usage</span>
                  <span className="text-muted-foreground">{formatBytes(wifiTotal)}</span>
                </div>
                <DataUsageBar sent={usage.wifiTx} received={usage.wifiRx} />
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span>Mobile Usage</span>
                  <span className="text-muted-foreground">{formatBytes(mobileTotal)}</span>
                </div>
                <DataUsageBar sent={usage.mobileTx} received={usage.mobileRx} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-3 w-3" /> Upload total: {formatBytes(usage.wifiTx + usage.mobileTx)}
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-3 w-3" /> Download total: {formatBytes(usage.wifiRx + usage.mobileRx)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network History</CardTitle>
          <CardDescription>Recent Wi-Fi and mobile data activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <Select selectedKey={connectionType} onSelectionChange={(key) => setConnectionType(key as "all" | "wifi" | "mobile_data")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  <SelectItem id="all" textValue="All">All Connections</SelectItem>
                  <SelectItem id="wifi" textValue="Wi-Fi">Wi-Fi</SelectItem>
                  <SelectItem id="mobile_data" textValue="Mobile Data">Mobile Data</SelectItem>
                </SelectListBox>
              </SelectPopover>
            </Select>
            <Select selectedKey={sortOrder} onSelectionChange={(key) => setSortOrder(key as "desc" | "asc")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox>
                  <SelectItem id="desc" textValue="Newest">Newest First</SelectItem>
                  <SelectItem id="asc" textValue="Oldest">Oldest First</SelectItem>
                </SelectListBox>
              </SelectPopover>
            </Select>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>From</span>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-[160px]" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>To</span>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-[160px]" />
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead className="text-right w-[160px]">Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageSlice.map((log) => {
                      const totalBytes = log.bytes_received + log.bytes_sent;
                      const displayName = log.network_name || (log.connection_type === "wifi" ? "Wi-Fi" : "Mobile Data");

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.log_date).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                log.connection_type === "wifi" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                              )}
                            >
                              {log.connection_type === "wifi" ? "Wi-Fi" : "Mobile"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{displayName}</p>
                              <p className="text-xs text-muted-foreground">{log.employee_code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">{formatBytes(totalBytes)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatBytes(log.bytes_sent)} up / {formatBytes(log.bytes_received)} down
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Wifi className="h-8 w-8 mb-2 opacity-50" />
              <p>No network history available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
