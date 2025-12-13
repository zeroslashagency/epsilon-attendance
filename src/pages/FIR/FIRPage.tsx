import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/fir/reportService';
import { Report, ReportStatus, Priority } from '@/services/fir/types';
import { DashboardStats } from '@/components/FIR/DashboardStats';
import { FARModal } from '@/components/FIR/FARModal';
import { ShieldAlert, Plus, ChevronRight, Loader2 } from 'lucide-react';

const FIRPage: React.FC = () => {
    const { user, employeeName, role } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [farModalOpen, setFarModalOpen] = useState(false);
    const [farModalType, setFarModalType] = useState<'GOOD' | 'BAD' | null>(null);

    // Construct current user object for FIR components
    const currentUser = user ? {
        id: user.id,
        name: employeeName || 'Unknown',
        role: role || 'Employee',
        avatar: '' // Placeholder or fetch if available
    } : null;

    useEffect(() => {
        loadReports();
    }, [user]);

    const loadReports = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await reportService.getReports();
            // Filter based on role if needed, currently mockService might return all
            // In a real scenario, RLS would handle this, but for UI we might filter
            let userReports = data;
            if (role !== 'Super Admin') {
                userReports = data.filter(r =>
                    r.reporter.id === user.id ||
                    r.assignedTo?.id === user.id ||
                    r.currentOwner?.id === user.id ||
                    r.stage3?.by === user.id // Just in case
                );
            }
            setReports(userReports);
        } catch (error) {
            console.error("Failed to load reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type: 'GOOD' | 'BAD') => {
        setFarModalType(type);
        setFarModalOpen(true);
    };

    const handleReportSubmitted = () => {
        loadReports();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-10 h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Overview of your error reports and pending actions</p>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={() => handleOpenModal('GOOD')}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-green-200/50 dark:shadow-none transition-all active:scale-95"
                        >
                            <Plus size={18} /> Positive
                        </button>
                        <button
                            onClick={() => handleOpenModal('BAD')}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-red-200/50 dark:shadow-none transition-all active:scale-95"
                        >
                            <Plus size={18} /> Negative
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h2>
                    <DashboardStats reports={reports} />
                </div>

                {/* Recent Reports */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Recent Reports</h2>
                        <button
                            onClick={() => navigate('/reports')}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                            View All
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {reports.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-slate-500 dark:text-slate-400 mb-4">No reports found. Create your first report!</p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenModal('GOOD')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        + Positive
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal('BAD')}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        + Negative
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reports.slice(0, 5).map(report => (
                                    <div
                                        key={report.id}
                                        onClick={() => navigate(`/reports?id=${report.id}`)}
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition flex items-center gap-4"
                                    >
                                        <div className={`p-2 rounded-lg ${report.priority === Priority.High ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{report.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{report.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${report.status === ReportStatus.Closed ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                                                {report.status}
                                            </span>
                                            <div className="text-xs text-slate-400 mt-1">{new Date(report.reportedAt).toLocaleDateString()}</div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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

export default FIRPage;
