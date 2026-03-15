import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, BarChart3, ShieldCheck, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FintechPage = () => {
  const features = [
    { icon: CreditCard, title: "Financial Data Protection", desc: "Mask account numbers, SSNs, and transaction details before AI analysis." },
    { icon: BarChart3, title: "Risk Analysis with Privacy", desc: "Run fraud detection and risk models without exposing customer PII." },
    { icon: ShieldCheck, title: "PCI-DSS & SOX Compliance", desc: "Meet financial industry regulations while leveraging cutting-edge AI." },
    { icon: Fingerprint, title: "Identity Verification", desc: "Process KYC/AML checks with tokenized personal data." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            AI Privacy for <span className="text-primary">Fintech</span>
          </motion.h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Harness AI for financial analysis and customer service while protecting sensitive financial data.
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

export default FintechPage;
