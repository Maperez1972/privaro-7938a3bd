import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

const Terms = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Terms of Service — Privaro" description="Privaro terms of service governing use of the AI privacy proxy platform." path="/terms" />
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-8">{t("terms.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("terms.lastUpdated")}</p>
        <p className="text-muted-foreground leading-relaxed mb-10">{t("terms.intro")}</p>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((i) => (
          <section key={i} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{t(`terms.s${i}.title`)}</h2>
            <p className="text-muted-foreground leading-relaxed">{t(`terms.s${i}.body`)}</p>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
