import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter, Download, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CallLog {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  number: string;
  name?: string;
  duration: string;
  timestamp: string;
  date: string;
  recordingUrl?: string; // URL to the call recording
  hasRecording: boolean;
}

// Mock call history data - replace with real data from your backend
const mockCallHistory: CallLog[] = [
  {
    id: '1',
    type: 'incoming',
    number: '+91 98765 43210',
    name: 'John Doe',
    duration: '5:23',
    timestamp: '10:30 AM',
    date: '2025-10-12',
    hasRecording: true,
    recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Demo audio
  },
  {
    id: '2',
    type: 'outgoing',
    number: '+91 98765 43211',
    name: 'Jane Smith',
    duration: '2:15',
    timestamp: '09:45 AM',
    date: '2025-10-12',
    hasRecording: true,
    recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' // Demo audio
  },
  {
    id: '3',
    type: 'missed',
    number: '+91 98765 43212',
    name: 'Bob Johnson',
    duration: '0:00',
    timestamp: '08:20 AM',
    date: '2025-10-12',
    hasRecording: false
  },
  {
    id: '4',
    type: 'incoming',
    number: '+91 98765 43213',
    duration: '12:45',
    timestamp: '05:30 PM',
    date: '2025-10-11',
    hasRecording: true,
    recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' // Demo audio
  },
  {
    id: '5',
    type: 'outgoing',
    number: '+91 98765 43214',
    name: 'Alice Williams',
    duration: '8:30',
    timestamp: '03:15 PM',
    date: '2025-10-11',
    hasRecording: true,
    recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' // Demo audio
  }
];

const CallHistoryPage = () => {
  const { employeeName, employeeCode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  const filteredCalls = mockCallHistory.filter(call => {
    const matchesSearch = call.number.includes(searchQuery) || 
                         call.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || call.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case 'outgoing':
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getCallBadge = (type: string) => {
    switch (type) {
      case 'incoming':
        return <Badge className="bg-green-600">Incoming</Badge>;
      case 'outgoing':
        return <Badge className="bg-blue-600">Outgoing</Badge>;
      case 'missed':
        return <Badge className="bg-red-600">Missed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting call history...');
  };

  const toggleCallExpand = (callId: string) => {
    if (expandedCallId === callId) {
      setExpandedCallId(null);
      setPlayingCallId(null);
    } else {
      setExpandedCallId(callId);
    }
  };

  const togglePlayPause = (callId: string) => {
    if (playingCallId === callId) {
      setPlayingCallId(null);
    } else {
      setPlayingCallId(callId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Call History</h1>
          <p className="text-muted-foreground">
            {employeeName} ({employeeCode})
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'incoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('incoming')}
                className="gap-1"
              >
                <PhoneIncoming className="h-3 w-3" />
                Incoming
              </Button>
              <Button
                variant={filterType === 'outgoing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('outgoing')}
                className="gap-1"
              >
                <PhoneOutgoing className="h-3 w-3" />
                Outgoing
              </Button>
              <Button
                variant={filterType === 'missed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('missed')}
                className="gap-1"
              >
                <PhoneMissed className="h-3 w-3" />
                Missed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Recent Calls ({filteredCalls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCalls.length > 0 ? (
              filteredCalls.map((call) => (
                <div key={call.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => call.hasRecording && toggleCallExpand(call.id)}
                  >
                    <div className="flex items-center gap-4">
                      {getCallIcon(call.type)}
                      <div>
                        <div className="font-medium">
                          {call.name || call.number}
                        </div>
                        {call.name && (
                          <div className="text-sm text-muted-foreground">
                            {call.number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{call.timestamp}</div>
                        <div className="text-xs text-muted-foreground">{call.date}</div>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        {call.duration}
                      </div>
                      {getCallBadge(call.type)}
                      {call.hasRecording && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCallExpand(call.id);
                          }}
                        >
                          {expandedCallId === call.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Call Recording Section */}
                  {expandedCallId === call.id && call.hasRecording && (
                    <div className="p-4 bg-muted/30 border-t">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePlayPause(call.id)}
                          className="gap-2"
                        >
                          {playingCallId === call.id ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Play Recording
                            </>
                          )}
                        </Button>
                        
                        {/* Audio Player */}
                        <div className="flex-1">
                          <audio
                            id={`audio-${call.id}`}
                            src={call.recordingUrl}
                            controls
                            className="w-full h-10"
                            onPlay={() => setPlayingCallId(call.id)}
                            onPause={() => setPlayingCallId(null)}
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = call.recordingUrl || '';
                            link.download = `call-recording-${call.id}.mp3`;
                            link.click();
                          }}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>📞 Call Recording - {call.duration}</p>
                        <p className="text-xs mt-1">Click play to listen to the call recording</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No calls found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Call history will appear here'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallHistoryPage;
