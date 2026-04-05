import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import LangSync from "@/components/LangSync";

const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const LegalPage = lazy(() => import("./pages/use-cases/Legal"));
const FintechPage = lazy(() => import("./pages/use-cases/Fintech"));
const HealthPage = lazy(() => import("./pages/use-cases/Health"));
const AgentsPage = lazy(() => import("./pages/use-cases/Agents"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailConfirmed = lazy(() => import("./pages/EmailConfirmed"));
const Security = lazy(() => import("./pages/Security"));
const AppLayout = lazy(() => import("./components/app/AppLayout"));
const Chat = lazy(() => import("./pages/app/Chat"));
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Pipelines = lazy(() => import("./pages/app/Pipelines"));
const Sandbox = lazy(() => import("./pages/app/Sandbox"));
const Policies = lazy(() => import("./pages/app/Policies"));
const AuditLogs = lazy(() => import("./pages/app/AuditLogs"));
const Settings = lazy(() => import("./pages/app/Settings"));
const AdminProviders = lazy(() => import("./pages/app/admin/AdminProviders"));
const AdminUsers = lazy(() => import("./pages/app/admin/AdminUsers"));
const AdminApiKeys = lazy(() => import("./pages/app/admin/AdminApiKeys"));
const AdminBilling = lazy(() => import("./pages/app/admin/AdminBilling"));
const AdminSettings = lazy(() => import("./pages/app/admin/AdminSettings"));
const AdminPolicyPresets = lazy(() => import("./pages/app/admin/AdminPolicyPresets"));
const AdminVault = lazy(() => import("./pages/app/admin/AdminVault"));
const AdminEncryptionKeys = lazy(() => import("./pages/app/admin/AdminEncryptionKeys"));
const Onboarding = lazy(() => import("./pages/app/Onboarding"));
const AgentRuns = lazy(() => import("./pages/app/AgentRuns"));

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
          <LangSync />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              {/* Landing pages */}
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/use-cases/legal" element={<LegalPage />} />
              <Route path="/use-cases/fintech" element={<FintechPage />} />
              <Route path="/use-cases/health" element={<HealthPage />} />
              <Route path="/use-cases/agents" element={<AgentsPage />} />
              <Route path="/security" element={<Security />} />

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
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
                <Route path="onboarding" element={<Onboarding />} />
                {/* Admin/DPO routes */}
                <Route path="admin/audit-logs" element={<AdminDpoRoute><AuditLogs /></AdminDpoRoute>} />
                {/* Admin only routes */}
                <Route path="admin/providers" element={<AdminRoute><AdminProviders /></AdminRoute>} />
                <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="admin/api-keys" element={<AdminRoute><AdminApiKeys /></AdminRoute>} />
                <Route path="admin/vault" element={<AdminRoute><AdminVault /></AdminRoute>} />
                <Route path="admin/encryption-keys" element={<AdminDpoRoute><AdminEncryptionKeys /></AdminDpoRoute>} />
                <Route path="admin/policy-presets" element={<AdminRoute><AdminPolicyPresets /></AdminRoute>} />
                <Route path="admin/billing" element={<AdminRoute><AdminBilling /></AdminRoute>} />
                <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;