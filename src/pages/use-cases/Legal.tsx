import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, FileText, Scale, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LegalPage = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Shield, title: "Client-Attorney Privilege Protection", desc: "Automatically detect and mask PII in legal documents before AI processing." },
    { icon: FileText, title: "Document Review at Scale", desc: "Process thousands of contracts while maintaining strict data privacy compliance." },
    { icon: Scale, title: "Regulatory Compliance", desc: "Meet GDPR, CCPA, and bar association requirements for data handling." },
    { icon: Lock, title: "Blockchain Audit Trail", desc: "Immutable logs of every AI interaction for litigation support." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            AI Privacy for <span className="text-primary">Legal Firms</span>
          </motion.h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Leverage AI for contract analysis, due diligence, and legal research without compromising client confidentiality.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mt-12">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card">
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-16">
          <Button size="lg" onClick={() => window.location.href = "/#beta"}>Request Early Access</Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LegalPage;
