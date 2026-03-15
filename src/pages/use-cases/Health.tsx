import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, FileSearch, Hospital, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HealthPage = () => {
  const features = [
    { icon: Heart, title: "PHI Protection", desc: "Automatically detect and tokenize protected health information before AI processing." },
    { icon: FileSearch, title: "Clinical Research", desc: "Analyze patient data for research insights without exposing individual records." },
    { icon: Hospital, title: "HIPAA Compliance", desc: "Full compliance with healthcare privacy regulations across all AI interactions." },
    { icon: Lock, title: "De-identification Engine", desc: "Advanced NLP-based de-identification that preserves clinical context." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            AI Privacy for <span className="text-primary">Healthcare</span>
          </motion.h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Enable AI-powered diagnostics, research, and patient care while safeguarding protected health information.
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

export default HealthPage;
