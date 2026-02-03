import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/fir/reportService';
import { Report, ReportStatus, User } from '@/services/fir/types';
import { ReportCard } from '@/components/FIR/ReportCard';
import { ReportDetail } from '@/components/FIR/ReportDetail';
import { FARModal } from '@/components/FIR/FARModal';
import { Plus, Search, ShieldAlert, ChevronRight, Loader2 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { user, employeeName, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'MyAction' | 'Submitted'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const [farModalOpen, setFarModalOpen] = useState(false);
  const [farModalType, setFarModalType] = useState<'GOOD' | 'BAD' | null>(null);

  // Construct current user for FIR components
  const currentUser: User | null = user ? {
    id: user.id,
    name: employeeName || 'Unknown',
    role: role || 'Employee',
    avatar: ''
  } : null;

  // Handle URL query param for initial selection
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setSelectedReportId(idFromUrl);
    }
  }, [searchParams]);

  // Update URL when selection changes
  const handleSelectReport = (id: string | null) => {
    setSelectedReportId(id);
    if (id) {
      setSearchParams({ id });
    } else {
      setSearchParams({});
    }
  };

  const loadReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await reportService.getReports();
      let userReports = data;
      // In a real app with RLS, the backend filters. Here we filter client side for the mock service/UI logic
      if (role !== 'Super Admin') {
        userReports = data.filter(r =>
          r.reporter.id === user.id ||
          r.assignedTo?.id === user.id ||
          r.currentOwner?.id === user.id
        );
      }
      setReports(userReports);
    } catch (error) {
      console.error("Failed to load reports", error);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleUpdateReport = (updated: Report) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleOpenModal = (type: 'GOOD' | 'BAD') => {
    setFarModalType(type);
    setFarModalOpen(true);
  };

  const handleReportSubmitted = () => {
    loadReports();
  };

  // Filter Logic
  const filteredReports = reports.filter(r => {
    // 1. Tab Filter
    if (filter === 'MyAction') {
      if (currentUser) {
        return r.currentOwner?.id === currentUser.id && r.status !== ReportStatus.Closed;
      }
      return false;
    }
    if (filter === 'Submitted') {
      if (currentUser) {
        return r.reporter.id === currentUser.id;
      }
      return false;
    }

    // 2. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.reporter.name.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* List Pane */}
      <div className={`${selectedReportId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[400px] xl:w-[450px] bg-background border-r border-border h-full`}>
        <div className="p-5 border-b border-border bg-background">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-foreground">All Reports</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal('GOOD')}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition active:scale-90"
                title="Positive Report"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => handleOpenModal('BAD')}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition active:scale-90"
                title="Negative Report"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('All')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${filter === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('Submitted')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${filter === 'Submitted' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilter('MyAction')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition ${filter === 'MyAction' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              My Action
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-muted/60 text-foreground placeholder:text-muted-foreground border border-transparent outline-none transition duration-200 focus:border-primary/40 focus:bg-background focus:ring-1 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No reports found matching criteria.</div>
          ) : (
            filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReportId === report.id}
                onClick={() => handleSelectReport(report.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail Pane */}
      <div className={`${selectedReportId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-muted/20 h-full relative`}>
        {selectedReport && currentUser ? (
          <div className="h-full flex flex-col">
            {/* Mobile Back Button */}
            <div className="md:hidden p-4 bg-background border-b border-border flex items-center gap-2 sticky top-0 z-30">
              <button onClick={() => handleSelectReport(null)} className="p-1 hover:bg-muted rounded-full text-muted-foreground">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <span className="font-semibold text-foreground">Report Details</span>
            </div>

            <ReportDetail
              report={selectedReport}
              onUpdate={handleUpdateReport}
              currentUser={currentUser}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Report Selected</h3>
            <p className="text-center max-w-xs mt-2 text-sm text-muted-foreground">Select a report from the list to view details, audit trail, and take action.</p>
          </div>
        )}
      </div>

      <FARModal
        isOpen={farModalOpen}
        onClose={() => setFarModalOpen(false)}
        type={farModalType}
        onReportSubmitted={handleReportSubmitted}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ReportsPage;
