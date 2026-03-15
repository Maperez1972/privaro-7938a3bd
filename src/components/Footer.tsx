import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const linkClass = "text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors";

  return (
    <footer className="py-10 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <a href="/privacy" className={linkClass}>{t("footer.privacy")}</a>
          <a href="/terms" className={linkClass}>{t("footer.terms")}</a>
          <a href="mailto:contact@privaro.ai" className={linkClass}>{t("footer.contact")}</a>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Privaro. {t("footer.rights")}</p>
          <p className="text-sm text-muted-foreground">
            {t("footer.tagline")} {t("footer.by")}{" "}
            <a href="https://icommunity.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">iCommunity Labs</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
