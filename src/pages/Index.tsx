import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import UrgencySection from "@/components/UrgencySection";
import ProblemSection from "@/components/ProblemSection";
import RiskGapSection from "@/components/RiskGapSection";
import SolutionSection from "@/components/SolutionSection";
import DashboardMockupSection from "@/components/DashboardMockupSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ComparisonSection from "@/components/ComparisonSection";
import SecuritySection from "@/components/SecuritySection";
import BlockchainSection from "@/components/BlockchainSection";
import UseCasesSection from "@/components/UseCasesSection";
import TechBriefSection from "@/components/TechBriefSection";
import BetaSection from "@/components/BetaSection";
import Footer from "@/components/Footer";

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
    </div>
  );
};

export default Index;
