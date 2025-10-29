import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  FileText,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PunchLog {
  time: string;
  direction: 'in' | 'out' | 'break';
  deviceId: string;
  confidence: 'high' | 'medium' | 'low';
  inferred?: boolean;
}

interface WorkInterval {
  checkIn: string;
  checkOut: string;
  duration: string;
  type: 'work' | 'break';
}

interface DayDetailData {
  date: string;
  status: string;
  punchLogs: PunchLog[];
  intervals: WorkInterval[];
  totalWorkTime: string;
  confidence: 'high' | 'medium' | 'low';
  hasAmbiguousPunches: boolean;
  isConfirmed: boolean;
  importedAt: string;
  corrections?: {
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

interface DayDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: DayDetailData | null;
  onConfirm: () => void;
  onEdit: () => void;
  onRequestCorrection: () => void;
}

export function DayDetailPanel({ 
  isOpen, 
  onClose, 
  data, 
  onConfirm, 
  onEdit, 
  onRequestCorrection 
}: DayDetailPanelProps) {
  if (!data) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-status-present';
      case 'medium': return 'text-status-late';
      case 'low': return 'text-status-absent';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-status-present';
      case 'late': return 'bg-status-late';
      case 'absent': return 'bg-status-absent';
      case 'sick': return 'bg-status-sick';
      case 'vacation': return 'bg-status-vacation';
      default: return 'bg-muted';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-background border-border overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day Details
          </SheetTitle>
          <SheetDescription>
            View detailed attendance information including work intervals, punch events, and audit data for {formatDate(data.date)}
          </SheetDescription>
          
          <div className="space-y-2">
            <p className="text-lg font-semibold">{formatDate(data.date)}</p>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-white", getStatusColor(data.status))}>
                {data.status}
              </Badge>
              <Badge variant="outline" className={getConfidenceColor(data.confidence)}>
                {data.confidence} confidence
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Ambiguous Warning */}
          {data.hasAmbiguousPunches && !data.isConfirmed && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                Some punches on this day were inferred or have low confidence. Please review and confirm or request corrections.
              </AlertDescription>
            </Alert>
          )}

          {/* Work Summary */}
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Work Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Work Time</p>
                  <p className="font-semibold text-lg">{data.totalWorkTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intervals</p>
                  <p className="font-semibold text-lg">{data?.intervals?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Intervals */}
          <div className="space-y-3">
            <h3 className="font-semibold">Work Intervals</h3>
            {data?.intervals?.length > 0 ? data.intervals.map((interval, index) => (
              <Card key={index} className="bg-gradient-accent border-border">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{interval.checkIn}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{interval.checkOut}</span>
                      </div>
                      <Badge variant="outline">
                        {interval.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{interval.duration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center text-muted-foreground">
                  No work intervals recorded
                </CardContent>
              </Card>
            )}
          </div>

          {/* Raw Punch Logs */}
          <div className="space-y-3">
            <h3 className="font-semibold">Punch Events</h3>
            <div className="space-y-2">
              {data?.punchLogs?.length > 0 ? data.punchLogs.map((log, index) => (
                <Card key={index} className="bg-gradient-accent border-border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.direction === 'in' ? 'default' : 'secondary'}>
                            {log.direction.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{log.time}</span>
                          {log.inferred && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              inferred
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Device: {log.deviceId}</p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={getConfidenceColor(log.confidence)}
                      >
                        {log.confidence}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No punch events recorded
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Audit Info */}
          <Card className="bg-gradient-accent border-border">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">Audit Information</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Imported: {new Date(data.importedAt).toLocaleString()}</p>
                {data.isConfirmed && (
                  <p className="flex items-center gap-1 text-status-present">
                    <CheckCircle className="h-3 w-3" />
                    Confirmed by employee
                  </p>
                )}
                {data.corrections && (
                  <p>Correction Status: {data.corrections.status}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="space-y-3 pb-6">
            {!data.isConfirmed && (
              <Button 
                onClick={onConfirm} 
                className="w-full bg-status-present hover:bg-status-present/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I confirm these intervals
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onEdit} variant="outline" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Times
              </Button>
              <Button onClick={onRequestCorrection} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Request Correction
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}