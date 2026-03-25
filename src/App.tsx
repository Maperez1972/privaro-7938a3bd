import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import LegalPage from "./pages/use-cases/Legal";
import FintechPage from "./pages/use-cases/Fintech";
import HealthPage from "./pages/use-cases/Health";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Security from "./pages/Security";
import AppLayout from "./components/app/AppLayout";
import Chat from "./pages/app/Chat";
import Dashboard from "./pages/app/Dashboard";
import Pipelines from "./pages/app/Pipelines";
import Sandbox from "./pages/app/Sandbox";
import Policies from "./pages/app/Policies";
import AuditLogs from "./pages/app/AuditLogs";
import Settings from "./pages/app/Settings";
import AdminProviders from "./pages/app/admin/AdminProviders";
import AdminUsers from "./pages/app/admin/AdminUsers";
import AdminApiKeys from "./pages/app/admin/AdminApiKeys";
import AdminBilling from "./pages/app/admin/AdminBilling";
import AdminSettings from "./pages/app/admin/AdminSettings";
import AdminPolicyPresets from "./pages/app/admin/AdminPolicyPresets";
import AdminVault from "./pages/app/admin/AdminVault";
import Onboarding from "./pages/app/Onboarding";
import AgentRuns from "./pages/app/AgentRuns";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  if (!hasRole("admin")) return <Navigate to="/app" replace />;
  return <>{children}</>;
};

const AdminDpoRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  if (!hasRole("admin") && !hasRole("dpo")) return <Navigate to="/app" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing pages */}
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/use-cases/legal" element={<LegalPage />} />
              <Route path="/use-cases/fintech" element={<FintechPage />} />
              <Route path="/use-cases/health" element={<HealthPage />} />
              <Route path="/security" element={<Security />} />

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* App (protected) */}
              <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/app/chat" replace />} />
                <Route path="chat" element={<Chat />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pipelines" element={<Pipelines />} />
                <Route path="sandbox" element={<Sandbox />} />
                <Route path="policies" element={<Policies />} />
                <Route path="agent-runs" element={<AgentRuns />} />
                <Route path="settings" element={<Settings />} />
                <Route path="onboarding" element={<AdminRoute><Onboarding /></AdminRoute>} />
                {/* Admin/DPO routes */}
                <Route path="admin/audit-logs" element={<AdminDpoRoute><AuditLogs /></AdminDpoRoute>} />
                {/* Admin only routes */}
                <Route path="admin/providers" element={<AdminRoute><AdminProviders /></AdminRoute>} />
                <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="admin/api-keys" element={<AdminRoute><AdminApiKeys /></AdminRoute>} />
                <Route path="admin/vault" element={<AdminRoute><AdminVault /></AdminRoute>} />
                <Route path="admin/policy-presets" element={<AdminRoute><AdminPolicyPresets /></AdminRoute>} />
                <Route path="admin/billing" element={<AdminRoute><AdminBilling /></AdminRoute>} />
                <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;