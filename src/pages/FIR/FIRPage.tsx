import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/fir';
import { useFIRStore, FIRView } from '@/hooks/fir/useFIRStore';
import { DashboardView } from '@/components/FIR/DashboardView';
import { ReportsView } from '@/components/FIR/ReportsView';
import { CategoryManager } from '@/components/FIR/CategoryManager';
import { AnalyticsView } from '@/components/FIR/AnalyticsView';
import { FARModal } from '@/components/FIR/FARModal';
import { useSearchParams } from 'react-router-dom'; // Assuming react-router based on src/pages structure
// If proper routing hook is needed, adapt accordingly. The source used next/navigation.
// Since this is Vite + React, I'll use a local state or checking window.location if router isn't clear.
// But mostly these projects use 'react-router-dom'. I'll check package.json if unsure.
// For now I'll use standard window params or just state if no router.
// Actually, let's stick to simple state if we can, but the source synced with URL.
// I will implement URL syncing using window.history.pushState for now to avoid dependency assumptions if possible,
// or just standard React state.

export default function FIRPage() {
    // Auth State
    const { user, isAuthenticated, loading: authLoading, employeeName, role } = useAuth();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Manual profile construction from useAuth
    useEffect(() => {
        if (user && employeeName) {
            setCurrentUser({
                id: user.id,
                name: employeeName || 'User',
                role: (role as any) || 'Reporter',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName || 'U')}&background=random`,
            });
        }
    }, [user, employeeName, role]);

    // FIR Store
    const store = useFIRStore(currentUser);

    // Initial View Sync (Simple implementation without router hook dependency for safety)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view') as FIRView | null;
        if (viewParam && ['dashboard', 'reports', 'categories', 'analytics'].includes(viewParam)) {
            store.setCurrentView(viewParam);
        }
    }, []);

    // Update URL when view changes
    const handleViewChange = (view: FIRView) => {
        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        window.history.pushState({}, '', url.toString());
        store.setCurrentView(view);
    };

    // Handle report submission
    const handleReportSubmitted = () => {
        store.loadReports();
        handleViewChange('reports');
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated || !currentUser) {
        return (
            <div className="p-10 text-center text-muted-foreground">
                Please log in to access FIR Reporter.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-muted/40 overflow-hidden font-sans rounded-xl border border-border shadow-sm">
            {/* View Selector / Navigation - Optional or integrated in specific views */}
            {/* Navigation Bar could go here if not provided by layout */}

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-background">
                {store.currentView === 'dashboard' && (
                    <DashboardView
                        reports={store.reports}
                        onOpenModal={store.openFARModal}
                        onSelectReport={store.selectReport}
                        onNavigateToReports={() => handleViewChange('reports')}
                    />
                )}

                {store.currentView === 'reports' && (
                    <ReportsView
                        reports={store.reports}
                        filteredReports={store.filteredReports}
                        selectedReportId={store.selectedReportId}
                        selectedReport={store.selectedReport}
                        currentUser={currentUser}
                        filter={store.filter}
                        isLoading={store.isLoading}
                        searchQuery={store.searchQuery}
                        onSelectReport={store.selectReport}
                        onUpdateReport={store.updateReport}
                        onOpenModal={store.openFARModal}
                        onFilterChange={store.setFilter}
                        onSearchChange={store.setSearchQuery}
                    />
                )}

                {store.currentView === 'categories' && (
                    <div className="h-full overflow-y-auto p-6">
                        <CategoryManager />
                    </div>
                )}

                {store.currentView === 'analytics' && (
                    <div className="h-full overflow-y-auto p-6">
                        <AnalyticsView reports={store.reports} />
                    </div>
                )}
            </main>

            {/* FAR Modal */}
            <FARModal
                isOpen={store.farModalOpen}
                onClose={store.closeFARModal}
                type={store.farModalType}
                onReportSubmitted={handleReportSubmitted}
                currentUser={currentUser}
            />
        </div>
    );
}
