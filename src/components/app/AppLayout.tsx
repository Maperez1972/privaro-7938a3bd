import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, GitBranch, FlaskConical, ShieldCheck, LogOut, ChevronLeft, ChevronRight, User, Cpu, Users, Key, KeyRound, CreditCard, Settings2, MessageSquare, FileText, Zap, Settings, Rocket, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import logoPrivaro from "@/assets/logo-privaro.png";

const navItems = [
  { label: "Conversations", icon: MessageSquare, href: "/app/chat" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
  { label: "AI Pipelines", icon: Zap, href: "/app/pipelines" },
  { label: "PII Sandbox", icon: FlaskConical, href: "/app/sandbox" },
  { label: "Policy Engine", icon: ShieldCheck, href: "/app/policies" },
  { label: "Settings", icon: Settings, href: "/app/settings" },
];
const onboardingItem = { label: "Onboarding", icon: Rocket, href: "/app/onboarding" };
const adminDpoItems = [{ label: "Audit Logs", icon: FileText, href: "/app/admin/audit-logs" }];
const adminOnlyItems = [
  { label: "LLM Providers", icon: Cpu, href: "/app/admin/providers" },
  { label: "Users", icon: Users, href: "/app/admin/users" },
  { label: "Tokens Vault", icon: KeyRound, href: "/app/admin/vault" },
  { label: "Policy Presets", icon: ShieldCheck, href: "/app/admin/policy-presets" },
  { label: "API Keys", icon: Key, href: "/app/admin/api-keys" },
  { label: "Billing", icon: CreditCard, href: "/app/admin/billing" },
  { label: "Admin Settings", icon: Settings2, href: "/app/admin/settings" },
];

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, profile, roles, hasRole, signOut } = useAuth();
  const isAdmin = hasRole("admin");
  const isDpo = hasRole("dpo");
  const showAdminSection = isAdmin || isDpo;

  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem("privaro-onboarding-done") === "true"
  );

  useEffect(() => {
    const handler = () => setOnboardingDone(localStorage.getItem("privaro-onboarding-done") === "true");
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const renderNavItem = (item: { label: string; icon: any; href: string }, showBadge?: boolean) => {
    const isActive = item.href === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link key={item.href} to={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors", isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && (
          <>
            <span>{item.label}</span>
            {showBadge && <span className="ml-auto text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">NEW</span>}
          </>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn("flex flex-col border-r border-border bg-sidebar transition-all duration-200", collapsed ? "w-16" : "w-60")}>
        <div className="h-16 flex items-center px-3 border-b border-border">
          {!collapsed && <img src={logoPrivaro} alt="Privaro" className="h-12" />}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
          {isAdmin && !onboardingDone && renderNavItem(onboardingItem)}
          {showAdminSection && (
            <>
              <div className="my-3 border-t border-border" />
              {!collapsed && <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Admin</p>}
              {adminDpoItems.map((item) => renderNavItem(item))}
              {isAdmin && adminOnlyItems.map((item) => renderNavItem(item))}
            </>
          )}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{profile?.full_name ?? user?.email}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{roles[0] ?? "viewer"}</p>
              </div>
            )}
            <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors" title="Sign out"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
};

export default AppLayout;
