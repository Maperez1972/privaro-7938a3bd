import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Scale, HeartPulse, BarChart3, Bot, Menu } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import logoPrivaro from "@/assets/logo-privaro.png";

const useCases = [
  { icon: Scale, labelKey: "nav.usecases.legal", href: "/use-cases/legal", iconColor: "text-primary" },
  { icon: HeartPulse, labelKey: "nav.usecases.health", href: "/use-cases/health", iconColor: "text-emerald-400" },
  { icon: BarChart3, labelKey: "nav.usecases.consulting", href: "/use-cases/fintech", iconColor: "text-sky-400" },
  { icon: Bot, labelKey: "nav.usecases.agents", href: "/use-cases/agents", iconColor: "text-amber-400" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t("nav.problem"), href: "/#problem" },
    { label: t("nav.solution"), href: "/#solution" },
    { label: t("nav.howItWorks"), href: "/#how-it-works" },
    { label: t("nav.security"), href: "/security" },
  ];

  const isUseCasePage = location.pathname.startsWith("/use-cases");

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoPrivaro} alt="Privaro" className="h-[7.5rem] w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen((v) => !v)} className={`flex items-center gap-1.5 text-sm transition-colors ${isUseCasePage ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.usecases")}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden">
                  {useCases.map((uc) => {
                    const Icon = uc.icon;
                    const isActive = location.pathname === uc.href;
                    return (
                      <Link key={uc.href} to={uc.href} className={`flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-secondary ${isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"}`}>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${uc.iconColor}`} />
                        {t(uc.labelKey)}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5 hover:border-primary/40" aria-label="Toggle language">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium uppercase tracking-wide">{lang === "en" ? "ES" : "EN"}</span>
          </button>

          <a href="/#early-access" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">{t("nav.cta")}</a>
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
          <SheetContent side="right" className="w-72 bg-background border-border p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex flex-col pt-12 px-6 gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border">{link.label}</a>
              ))}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1">{t("nav.usecases")}</p>
              {useCases.map((uc) => {
                const Icon = uc.icon;
                const isActive = location.pathname === uc.href;
                return (
                  <Link key={uc.href} to={uc.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 py-3 text-sm transition-colors border-b border-border ${isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${uc.iconColor}`} />
                    {t(uc.labelKey)}
                  </Link>
                );
              })}
              <a href="/#early-access" onClick={() => setMobileOpen(false)} className="mt-6 text-sm font-medium bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity text-center">{t("nav.cta")}</a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
};

export default Navbar;
