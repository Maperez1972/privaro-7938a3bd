import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const UrgencySection = lazy(() => import("@/components/UrgencySection"));
const ProblemSection = lazy(() => import("@/components/ProblemSection"));
const RiskGapSection = lazy(() => import("@/components/RiskGapSection"));
const SolutionSection = lazy(() => import("@/components/SolutionSection"));
const DashboardMockupSection = lazy(() => import("@/components/DashboardMockupSection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const ComparisonSection = lazy(() => import("@/components/ComparisonSection"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const BlockchainSection = lazy(() => import("@/components/BlockchainSection"));
const UseCasesSection = lazy(() => import("@/components/UseCasesSection"));
const TechBriefSection = lazy(() => import("@/components/TechBriefSection"));
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
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <UrgencySection />
        <ProblemSection />
        <RiskGapSection />
        <SolutionSection />
        <DashboardMockupSection />
        <HowItWorksSection />
        <ComparisonSection />
        <SecuritySection />
        <BlockchainSection />
        <UseCasesSection />
        <TechBriefSection />
        <BetaSection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
