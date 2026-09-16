import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";

const ProblemSection = lazy(() => import("@/components/ProblemSection"));
const DemoVideoSection = lazy(() => import("@/components/DemoVideoSection"));
const SolutionSection = lazy(() => import("@/components/SolutionSection"));
const DashboardMockupSection = lazy(() => import("@/components/DashboardMockupSection"));
const CostOptimizationSection = lazy(() => import("@/components/CostOptimizationSection"));
const UseCasesSection = lazy(() => import("@/components/UseCasesSection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const BlockchainSection = lazy(() => import("@/components/BlockchainSection"));
const TestimonialSection = lazy(() => import("@/components/TestimonialSection"));
const ComparisonTeaser = lazy(() => import("@/components/ComparisonTeaser"));
const BetaSection = lazy(() => import("@/components/BetaSection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') || hash.includes('error=otp_expired') || hash.includes('error_code=otp_expired')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');
      navigate(`/reset-password?error=${errorCode}&message=${encodeURIComponent(errorDesc || 'Link expired')}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="AI Governance Platform for LLM Privacy | Privaro" description="Privaro is the AI governance platform that detects PII, masks prompts and responses, and audits every LLM interaction. GDPR & EU AI Act ready." path="/" />
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <ProblemSection />
        <DemoVideoSection />
        <SolutionSection />
        <DashboardMockupSection />
        <CostOptimizationSection />
        <UseCasesSection />
        <HowItWorksSection />
        <SecuritySection />
        <BlockchainSection />
        <TestimonialSection />
        <ComparisonTeaser />
        <BetaSection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
