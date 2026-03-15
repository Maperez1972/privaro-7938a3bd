import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-8">{t("privacy.title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">{t("privacy.lastUpdated")}</p>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <section key={i} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{t(`privacy.s${i}.title`)}</h2>
            <p className="text-muted-foreground leading-relaxed">{t(`privacy.s${i}.body`)}</p>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
