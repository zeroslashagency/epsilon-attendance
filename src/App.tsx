import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { OperationsLayout } from "@/layouts/OperationsLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageErrorBoundary } from "@/components/ErrorBoundaryUtils";
import { lazy, Suspense } from "react";

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Lazy-loaded page components
const AttendancePage = lazy(() => import("./pages/Attendance/AttendancePage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const RoleTestPage = lazy(() => import("./pages/RoleTestPage"));
const CallHistoryPage = lazy(() => import("./pages/CallHistory/CallHistoryPage"));
const FIRPage = lazy(() => import("./pages/FIR/FIRPage"));
const ReportsPage = lazy(() => import("./pages/Reports/ReportsPage"));
const HistoryPage = lazy(() => import("./pages/History/HistoryPage"));
const CategoriesPage = lazy(() => import("./pages/Categories/CategoriesPage"));
const CallRecordingsPage = lazy(() => import("./pages/CallRecordings/CallRecordingsPage"));
const DeviceMonitoringPage = lazy(() => import("./pages/DeviceMonitoring/DeviceMonitoringPage"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="attendr-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="Super Admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } />

                  {/* Protected routes with MainLayout */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PageErrorBoundary>
                          <AttendancePage />
                        </PageErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/attendance" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PageErrorBoundary>
                          <AttendancePage />
                        </PageErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Operations Section with Sidebar */}
                  <Route path="/operations" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <OperationsLayout />
                      </MainLayout>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/operations/fir" replace />} />
                    <Route path="fir" element={
                      <PageErrorBoundary>
                        <FIRPage />
                      </PageErrorBoundary>
                    } />
                    <Route path="reports" element={
                      <PageErrorBoundary>
                        <ReportsPage />
                      </PageErrorBoundary>
                    } />
                    <Route path="history" element={
                      <PageErrorBoundary>
                        <HistoryPage />
                      </PageErrorBoundary>
                    } />
                    <Route path="categories" element={
                      <PageErrorBoundary>
                        <CategoriesPage />
                      </PageErrorBoundary>
                    } />
                  </Route>

                  {/* Calls (Separate Section) */}
                  <Route path="/call-recordings" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PageErrorBoundary>
                          <CallRecordingsPage />
                        </PageErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Device Monitoring Section */}
                  <Route path="/device-monitoring" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PageErrorBoundary>
                          <DeviceMonitoringPage />
                        </PageErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Legacy Routes - redirect to Operations */}
                  <Route path="/fir" element={<Navigate to="/operations/fir" replace />} />
                  <Route path="/reports" element={<Navigate to="/operations/reports" replace />} />
                  <Route path="/history" element={<Navigate to="/operations/history" replace />} />
                  <Route path="/categories" element={<Navigate to="/operations/categories" replace />} />

                  {/* Utility Routes */}
                  <Route path="/call-history" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PageErrorBoundary>
                          <CallHistoryPage />
                        </PageErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/role-test" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RoleTestPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/coming-soon" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ComingSoonPage feature="Coming Soon" />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
