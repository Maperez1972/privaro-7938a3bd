import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, GitBranch, FlaskConical, ShieldCheck, LogOut, ChevronLeft, ChevronRight, ChevronDown, User, Cpu, Users, Key, KeyRound, CreditCard, Settings2, MessageSquare, FileText, Zap, Settings, Rocket, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import logoPrivaro from "@/assets/logo-privaro.png";

const navItems = [
  { label: "Conversations", icon: MessageSquare, href: "/app/chat" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
  { label: "AI Pipelines", icon: Zap, href: "/app/pipelines" },
  { label: "PII Sandbox", icon: FlaskConical, href: "/app/sandbox" },
  { label: "Policy Engine", icon: ShieldCheck, href: "/app/policies" },
  { label: "Agent Runs", icon: Bot, href: "/app/agent-runs" },
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
  const [adminExpanded, setAdminExpanded] = useState(
    () => localStorage.getItem("privaro-admin-expanded") === "true"
  );
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
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

  // Auto-redirect to onboarding if not completed (except if already there)
  useEffect(() => {
    if (!onboardingDone && location.pathname !== "/app/onboarding") {
      // Small delay to let layout render
      const t = setTimeout(() => {
        window.history.replaceState(null, "", "/app/onboarding");
        window.location.href = "/app/onboarding";
      }, 0);
      return () => clearTimeout(t);
    }
  }, [onboardingDone, location.pathname]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateShadows = () => {
      const { scrollTop, scrollHeight, clientHeight } = nav;
      const hasOverflow = scrollHeight > clientHeight + 1;
      setShowTopShadow(hasOverflow && scrollTop > 2);
      setShowBottomShadow(hasOverflow && scrollTop + clientHeight < scrollHeight - 2);
    };

    updateShadows();
    requestAnimationFrame(updateShadows);

    nav.addEventListener("scroll", updateShadows, { passive: true });
    window.addEventListener("resize", updateShadows);

    return () => {
      nav.removeEventListener("scroll", updateShadows);
      window.removeEventListener("resize", updateShadows);
    };
  }, [collapsed, onboardingDone, showAdminSection, isAdmin, location.pathname]);

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
    <div className="h-screen bg-background flex overflow-hidden">
      <aside className={cn("min-h-0 flex flex-col border-r border-border bg-sidebar transition-all duration-200", collapsed ? "w-16" : "w-60")}>
        <div className="h-16 flex items-center px-3 border-b border-border">
          {!collapsed && <img src={logoPrivaro} alt="Privaro" className="h-12" />}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative flex-1 min-h-0">
          <nav ref={navRef} className="h-full overflow-y-auto py-4 px-2 space-y-1">
            {navItems.map((item) => renderNavItem(item))}
            {isAdmin && !onboardingDone && renderNavItem(onboardingItem)}
            {showAdminSection && (
              <>
                <div className="my-3 border-t border-border" />
                {!collapsed && (
                  <button
                    onClick={() => { const next = !adminExpanded; setAdminExpanded(next); localStorage.setItem("privaro-admin-expanded", String(next)); }}
                    className="flex items-center justify-between w-full px-3 py-1 group hover:bg-secondary/30 rounded-md transition-colors"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Admin</span>
                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", !adminExpanded && "-rotate-90")} />
                  </button>
                )}
                {(collapsed || adminExpanded) && (
                  <>
                    {adminDpoItems.map((item) => renderNavItem(item))}
                    {isAdmin && adminOnlyItems.map((item) => renderNavItem(item))}
                  </>
                )}
              </>
            )}
          </nav>

          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-sidebar to-transparent transition-opacity duration-200",
              showTopShadow ? "opacity-100" : "opacity-0"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-sidebar to-transparent transition-opacity duration-200",
              showBottomShadow ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

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
      <main className="flex-1 min-h-0 overflow-auto"><Outlet /></main>
    </div>
  );
};

export default AppLayout;
