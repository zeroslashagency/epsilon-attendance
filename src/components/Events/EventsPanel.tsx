import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Power, Wifi, Bluetooth, ScreenShare, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeviceEvent } from "@/services/deviceMonitoringService";
import { useEffect, useMemo, useState } from "react";

type EventCategory = "all" | "power" | "screen" | "network" | "bluetooth" | "system";

interface EventsPanelProps {
  deviceEvents: DeviceEvent[];
  isLoading: boolean;
}

function getEventCategory(eventType: string): EventCategory {
  const value = eventType.toLowerCase();
  if (value.includes("power") || value.includes("shutdown") || value.includes("boot")) return "power";
  if (value.includes("screen") || value.includes("lock") || value.includes("unlock")) return "screen";
  if (value.includes("wifi") || value.includes("network") || value.includes("cell")) return "network";
  if (value.includes("bluetooth") || value.includes("bt_")) return "bluetooth";
  return "system";
}

function getSeverity(eventType: string): "info" | "warning" | "error" {
  const value = eventType.toLowerCase();
  if (value.includes("error") || value.includes("fail") || value.includes("critical")) return "error";
  if (value.includes("warning") || value.includes("low") || value.includes("offline")) return "warning";
  return "info";
}

function formatEventType(eventType: string): string {
  return eventType.replace(/_/g, " ").toLowerCase();
}

function getEventIcon(category: EventCategory) {
  switch (category) {
    case "power":
      return Power;
    case "screen":
      return ScreenShare;
    case "network":
      return Wifi;
    case "bluetooth":
      return Bluetooth;
    default:
      return Info;
  }
}

function renderMetadata(metadata: unknown): string {
  if (metadata == null) return "--";
  if (typeof metadata === "string") return metadata;
  if (typeof metadata !== "object") return String(metadata);
  try {
    const entries = Object.entries(metadata as Record<string, unknown>).slice(0, 4);
    return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
  } catch {
    return "--";
  }
}

export function EventsPanel({ deviceEvents, isLoading }: EventsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredEvents = useMemo(() => {
    return deviceEvents.filter((event) => {
      const category = getEventCategory(event.event_type);
      if (categoryFilter !== "all" && category !== categoryFilter) return false;
      if (!search) return true;
      const haystack = `${event.event_type} ${event.employee_code} ${JSON.stringify(event.metadata || {})}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [deviceEvents, categoryFilter, search]);

  const timeFilteredEvents = useMemo(() => {
    if (selectedHour === null) return filteredEvents;
    return filteredEvents.filter((event) => new Date(event.event_time).getHours() === selectedHour);
  }, [filteredEvents, selectedHour]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, search, selectedHour, deviceEvents.length]);

  const timelineCounts = useMemo(() => {
    const buckets = Array.from({ length: 24 }, () => 0);
    filteredEvents.forEach((event) => {
      const hour = new Date(event.event_time).getHours();
      buckets[hour] += 1;
    });
    return buckets;
  }, [filteredEvents]);

  const totalPages = Math.max(1, Math.ceil(timeFilteredEvents.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return timeFilteredEvents.slice(start, start + pageSize);
  }, [timeFilteredEvents, page, pageSize]);

  function handleExport(): void {
    const rows = timeFilteredEvents.map((event) => ({
      time: new Date(event.event_time).toISOString(),
      employee: event.employee_code,
      type: event.event_type,
      category: getEventCategory(event.event_type),
      severity: getSeverity(event.event_type),
      details: JSON.stringify(event.metadata || {}),
    }));

    const header = "time,employee,type,category,severity,details";
    const body = rows
      .map((row) => [row.time, row.employee, row.type, row.category, row.severity, row.details]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","))
      .join("\n");

    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `device-events-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Device Events</CardTitle>
          <CardDescription>System, connectivity, and activity logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Select selectedKey={categoryFilter} onSelectionChange={(key) => setCategoryFilter(key as EventCategory)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    <SelectItem id="all" textValue="All">All Events</SelectItem>
                    <SelectItem id="power" textValue="Power">Power</SelectItem>
                    <SelectItem id="screen" textValue="Screen">Screen</SelectItem>
                    <SelectItem id="network" textValue="Network">Network</SelectItem>
                    <SelectItem id="bluetooth" textValue="Bluetooth">Bluetooth</SelectItem>
                    <SelectItem id="system" textValue="System">System</SelectItem>
                  </SelectListBox>
                </SelectPopover>
              </Select>
              <Input
                placeholder="Search events, metadata, employee code"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="md:w-[320px]"
              />
              {selectedHour !== null && (
                <Button variant="outline" size="sm" onClick={() => setSelectedHour(null)}>
                  Clear hour: {selectedHour}:00
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing {timeFilteredEvents.length} of {deviceEvents.length} events</span>
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
          <CardDescription>Chronological list of device activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-end gap-1 h-16">
              {timelineCounts.map((count, hour) => {
                const height = Math.max(6, Math.min(56, count * 4));
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "w-full rounded-sm bg-primary/20 cursor-pointer",
                        selectedHour === hour && "bg-primary/60"
                      )}
                      style={{ height: `${height}px` }}
                      title={`${hour}:00 - ${count} events`}
                      onClick={() => setSelectedHour(hour)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setSelectedHour(hour);
                        }
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : timeFilteredEvents.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right w-[120px]">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageSlice.map((event) => {
                  const category = getEventCategory(event.event_type);
                  const severity = getSeverity(event.event_type);
                  const Icon = getEventIcon(category);

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.event_time).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium capitalize">{formatEventType(event.event_type)}</p>
                          <p className="text-xs text-muted-foreground">{event.employee_code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {renderMetadata(event.metadata)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={severity === "error" ? "destructive" : severity === "warning" ? "secondary" : "outline"}
                          className={cn(severity === "info" && "text-muted-foreground")}
                        >
                          {severity}
                        </Badge>
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
              <List className="h-8 w-8 mb-2 opacity-50" />
              <p>No events available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
