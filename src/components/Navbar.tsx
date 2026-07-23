import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Scale, HeartPulse, BarChart3, Bot, Menu, AlertTriangle, ShieldCheck, Layers, Lock, BookOpen, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import logoPrivaro from "@/assets/logo-privaro.webp";

type MenuItem = {
  labelKey: string;
  href: string;
  icon?: typeof Scale;
  iconColor?: string;
};

const productItems: MenuItem[] = [
  { icon: AlertTriangle, labelKey: "nav.problem", href: "/#problem", iconColor: "text-rose-400" },
  { icon: ShieldCheck, labelKey: "nav.solution", href: "/#solution", iconColor: "text-primary" },
  { icon: Layers, labelKey: "nav.howItWorks", href: "/#how-it-works", iconColor: "text-sky-400" },
  { icon: Lock, labelKey: "nav.security", href: "/security", iconColor: "text-emerald-400" },
];

const useCases: MenuItem[] = [
  { icon: Scale, labelKey: "nav.usecases.legal", href: "/use-cases/legal", iconColor: "text-primary" },
  { icon: HeartPulse, labelKey: "nav.usecases.health", href: "/use-cases/health", iconColor: "text-emerald-400" },
  { icon: BarChart3, labelKey: "nav.usecases.consulting", href: "/use-cases/fintech", iconColor: "text-sky-400" },
  { icon: Bot, labelKey: "nav.usecases.agents", href: "/use-cases/agents", iconColor: "text-amber-400" },
];

const resourcesItems: MenuItem[] = [
  { icon: BookOpen, labelKey: "nav.docs", href: "/docs", iconColor: "text-primary" },
  { icon: FileText, labelKey: "nav.blog", href: "/blog", iconColor: "text-sky-400" },
  { icon: Sparkles, labelKey: "nav.changelog", href: "/changelog", iconColor: "text-amber-400" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "product" | "usecases" | "resources">(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashLink = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const [path, hash] = href.split('#');
    const targetPath = path || '/';

    if (location.pathname === targetPath) {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(targetPath);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isUseCasePage = location.pathname.startsWith("/use-cases");
  const isResourcePage = ["/docs", "/blog", "/changelog"].some((p) => location.pathname.startsWith(p));

  const renderDropdownItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const content = (
      <>
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${item.iconColor ?? ""}`} />}
        <span>{t(item.labelKey)}</span>
      </>
    );
    const className = `flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary ${isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"}`;
    return item.href.includes('#') ? (
      <a key={item.href} href={item.href} onClick={(e) => handleHashLink(e, item.href)} className={className}>{content}</a>
    ) : (
      <Link key={item.href} to={item.href} className={className}>{content}</Link>
    );
  };

  const renderDropdown = (
    key: "product" | "usecases" | "resources",
    label: string,
    items: MenuItem[],
    active: boolean,
  ) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenu((v) => (v === key ? null : key))}
        className={`flex items-center gap-1.5 text-sm transition-colors whitespace-nowrap ${active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === key ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {openMenu === key && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {items.map(renderDropdownItem)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : ""}`}>
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoPrivaro} alt="Privaro" className="h-[7.5rem] w-auto" width={120} height={120} />
        </Link>

        <div ref={menuRef} className="hidden md:flex items-center gap-5 lg:gap-6">
          {renderDropdown("product", t("nav.product"), productItems, location.pathname === "/security")}
          {renderDropdown("usecases", t("nav.usecases"), useCases, isUseCasePage)}
          {renderDropdown("resources", t("nav.resources"), resourcesItems, isResourcePage)}

          <Link to="/pricing" className={`text-sm transition-colors whitespace-nowrap ${location.pathname === "/pricing" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.pricing")}</Link>
          <Link to="/partners" className={`text-sm transition-colors whitespace-nowrap ${location.pathname === "/partners" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.partners")}</Link>
          <Link to="/demo" className={`text-sm transition-colors whitespace-nowrap ${location.pathname === "/demo" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.demo")}</Link>

          <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5 hover:border-primary/40" aria-label="Toggle language">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium uppercase tracking-wide">{lang === "en" ? "ES" : "EN"}</span>
          </button>

          <Link to="/ai-risk-assessment" className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Risk Assessment
          </Link>

          <a href="/#early-access" onClick={(e) => handleHashLink(e, '/#early-access')} className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">{t("nav.cta")}</a>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1">
            <Globe className="w-3 h-3" />
            <span className="uppercase">{lang === "en" ? "ES" : "EN"}</span>
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-72 bg-background border-border p-0 overflow-y-auto">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex flex-col pt-12 px-6 pb-6 gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2 mb-1">{t("nav.product")}</p>
              {productItems.map((item) => {
                const Icon = item.icon!;
                return item.href.includes('#') ? (
                  <a key={item.href} href={item.href} onClick={(e) => handleHashLink(e, item.href)} className="flex items-center gap-3 py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />{t(item.labelKey)}
                  </a>
                ) : (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />{t(item.labelKey)}
                  </Link>
                );
              })}

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">{t("nav.usecases")}</p>
              {useCases.map((uc) => {
                const Icon = uc.icon!;
                return (
                  <Link key={uc.href} to={uc.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">
                    <Icon className={`w-4 h-4 ${uc.iconColor}`} />{t(uc.labelKey)}
                  </Link>
                );
              })}

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">{t("nav.resources")}</p>
              {resourcesItems.map((item) => {
                const Icon = item.icon!;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />{t(item.labelKey)}
                  </Link>
                );
              })}

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">More</p>
              <Link to="/pricing" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">{t("nav.pricing")}</Link>
              <Link to="/partners" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">{t("nav.partners")}</Link>
              <Link to="/demo" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-muted-foreground hover:text-foreground border-b border-border">{t("nav.demo")}</Link>
              <Link to="/ai-risk-assessment" onClick={() => setMobileOpen(false)} className="py-3 text-sm text-primary hover:text-foreground border-b border-border">AI Risk Assessment</Link>

              <a href="/#early-access" onClick={(e) => handleHashLink(e, '/#early-access')} className="mt-6 text-sm font-medium bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity text-center">{t("nav.cta")}</a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
};

export default Navbar;
