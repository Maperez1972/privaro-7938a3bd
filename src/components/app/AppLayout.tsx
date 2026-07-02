import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMfaEnforcement } from "@/hooks/useMfaEnforcement";
import { LayoutDashboard, GitBranch, FlaskConical, ShieldCheck, LogOut, ChevronLeft, ChevronRight, ChevronDown, User, Cpu, Users, Key, KeyRound, CreditCard, Settings2, MessageSquare, FileText, Zap, Settings, Rocket, Bot, Lock, Building2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import logoPrivaro from "@/assets/logo-privaro.webp";
import Seo from "@/components/Seo";
import { usePartnerData } from "@/hooks/usePartnerData";

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/app/chat": { title: "Conversations — Privaro", description: "Run AI conversations through Privaro's privacy proxy with detection, tokenization, and audit logging." },
  "/app/dashboard": { title: "Dashboard — Privaro", description: "Monitor AI privacy posture: requests, detections, policy actions, and risk score across your organization." },
  "/app/pipelines": { title: "AI Pipelines — Privaro", description: "Configure AI pipelines, route requests to providers, and attach detection and policy controls." },
  "/app/sandbox": { title: "PII Sandbox — Privaro", description: "Test PII detection and policy actions on sample prompts before deploying to production pipelines." },
  "/app/policies": { title: "Policy Engine — Privaro", description: "Define policies that tokenize, anonymize, or block sensitive data before it reaches AI models." },
  "/app/agent-runs": { title: "Agent Runs — Privaro", description: "Inspect AI agent runs, verify governance evidence, and review per-step policy decisions." },
  "/app/settings": { title: "Settings — Privaro", description: "Manage your Privaro account, language, profile, and workspace preferences." },
  "/app/onboarding": { title: "Onboarding — Privaro", description: "Complete your Privaro onboarding to start governing enterprise AI." },
  "/app/setup-mfa": { title: "Set up MFA — Privaro", description: "Enable multi-factor authentication on your Privaro account." },
  "/app/verify-mfa": { title: "Verify MFA — Privaro", description: "Verify your multi-factor authentication code to continue." },
  "/app/admin/leads": { title: "Leads — Privaro Admin", description: "Review demo and tech-brief leads captured from the Privaro site." },
  "/app/partner/clients": { title: "Mis clientes — Privaro Partners", description: "Gestiona los clientes finales de tu integración partner con Privaro." },
  "/app/admin/audit-logs": { title: "Audit Logs — Privaro Admin", description: "Review the full audit log of AI requests, detections, policy decisions, and token access." },
  "/app/admin/encryption-keys": { title: "Encryption Keys — Privaro Admin", description: "Manage bring-your-own encryption keys (BYOK) used to protect the token vault." },
  "/app/admin/providers": { title: "LLM Providers — Privaro Admin", description: "Configure LLM provider connections and credentials available to your organization." },
  "/app/admin/users": { title: "Users — Privaro Admin", description: "Invite teammates, manage roles, and control access to the Privaro workspace." },
  "/app/admin/vault": { title: "Tokens Vault — Privaro Admin", description: "Inspect tokenized values stored in the vault and audit controlled reveal actions." },
  "/app/admin/policy-presets": { title: "Policy Presets — Privaro Admin", description: "Manage reusable policy presets that can be applied across pipelines." },
  "/app/admin/api-keys": { title: "API Keys — Privaro Admin", description: "Issue and rotate API keys for programmatic access to the Privaro proxy." },
  "/app/admin/billing": { title: "Billing — Privaro Admin", description: "Manage your Privaro subscription, invoices, and usage." },
  "/app/admin/settings": { title: "Admin Settings — Privaro Admin", description: "Configure organization-wide Privaro settings, data retention, and integrations." },
};
const DEFAULT_META = { title: "Privaro workspace", description: "Privaro enterprise AI privacy workspace." };

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
const adminDpoItems = [
  { label: "Leads", icon: Users, href: "/app/admin/leads" },
  { label: "Audit Logs", icon: FileText, href: "/app/admin/audit-logs" },
  { label: "Encryption Keys", icon: Lock, href: "/app/admin/encryption-keys" },
];
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
  const navigate = useNavigate();
  const { user, profile, roles, hasRole, signOut } = useAuth();
  useMfaEnforcement();
  const isAdmin = hasRole("admin");
  const isDpo = hasRole("dpo");
  const showAdminSection = isAdmin || isDpo;
  const canCheckPartnerSection = !!user && !["/app/setup-mfa", "/app/verify-mfa"].includes(location.pathname);
  const { data: partnerData } = usePartnerData({ enabled: canCheckPartnerSection, suppressErrors: true });
  const isPartner = !!partnerData;

  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem("privaro-onboarding-done") === "true"
  );

  useEffect(() => {
    const handler = () => setOnboardingDone(localStorage.getItem("privaro-onboarding-done") === "true");
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Auto-redirect to onboarding if not completed
  // Skip if user is in MFA flow (setup-mfa or verify-mfa take priority)
  useEffect(() => {
    const mfaRoutes = ["/app/setup-mfa", "/app/verify-mfa"];
    if (mfaRoutes.includes(location.pathname)) return;
    if (!onboardingDone && location.pathname !== "/app/onboarding") {
      navigate("/app/onboarding", { replace: true });
    }
  }, [onboardingDone, location.pathname, navigate]);

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

  const renderNavItem = (item: { label: string; icon: LucideIcon; href: string }, showBadge?: boolean) => {
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
      <Seo
        title={(ROUTE_META[location.pathname] ?? DEFAULT_META).title}
        description={(ROUTE_META[location.pathname] ?? DEFAULT_META).description}
        path={location.pathname}
        noindex
      />
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
            {!onboardingDone && renderNavItem(onboardingItem)}
            {isPartner && (
              <>
                <div className="my-3 border-t border-border" />
                {!collapsed && (
                  <div className="px-3 py-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Partner</span>
                  </div>
                )}
                {renderNavItem({ label: "Mis clientes", icon: Building2, href: "/app/partner/clients" })}
              </>
            )}
            {/* Admin fallback: always give admins access to the partner clients view */}
            {!isPartner && isAdmin && renderNavItem({ label: "Partner clients", icon: Building2, href: "/app/partner/clients" }, true)}
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
