import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageErrorBoundary } from "@/components/ErrorBoundaryUtils";

// Direct imports - lazy loading temporarily disabled for debugging
import AttendancePage from "./pages/Attendance/AttendancePage";
import OverviewPage from "./pages/Overview/OverviewPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import RoleTestPage from "./pages/RoleTestPage";
import CallHistoryPage from "./pages/CallHistory/CallHistoryPage";
import HeroShowcasePage from "./pages/HeroShowcasePage";
import FIRPage from "./pages/FIR/FIRPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import HistoryPage from "./pages/History/HistoryPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import { FIRLayout } from "./layouts/FIRLayout";

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
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/design-showcase" element={<HeroShowcasePage />} />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PageErrorBoundary>
                        <AttendancePage />
                      </PageErrorBoundary>
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/overview" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PageErrorBoundary>
                        <OverviewPage />
                      </PageErrorBoundary>
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PageErrorBoundary>
                        <CalendarPage />
                      </PageErrorBoundary>
                    </MainLayout>
                  </ProtectedRoute>
                } />
                {/* FIR Section Routes */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout>
                      <FIRLayout />
                    </MainLayout>
                  </ProtectedRoute>
                }>
                  <Route path="/fir" element={
                    <PageErrorBoundary>
                      <FIRPage />
                    </PageErrorBoundary>
                  } />
                  <Route path="/reports" element={
                    <PageErrorBoundary>
                      <ReportsPage />
                    </PageErrorBoundary>
                  } />
                  <Route path="/categories" element={
                    <PageErrorBoundary>
                      <CategoriesPage />
                    </PageErrorBoundary>
                  } />
                  <Route path="/history" element={
                    <PageErrorBoundary>
                      <HistoryPage />
                    </PageErrorBoundary>
                  } />
                </Route>
                <Route path="/role-test" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RoleTestPage />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
