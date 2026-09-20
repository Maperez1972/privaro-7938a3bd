import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";

import LiveDemoTeaser from "@/components/LiveDemoTeaser";

const ProblemSection = lazy(() => import("@/components/ProblemSection"));
// Hidden until the demo video is recorded. Re-add to restore the 16:9 slot:
// const DemoVideoSection = lazy(() => import("@/components/DemoVideoSection"));
const SolutionSection = lazy(() => import("@/components/SolutionSection"));
const RagTeaserStrip = lazy(() => import("@/components/RagTeaserStrip"));
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
      <LiveDemoTeaser />
      <Suspense fallback={null}>
        <ProblemSection />
        <SolutionSection />
        <RagTeaserStrip />
        <DashboardMockupSection />
        <CostOptimizationSection />
        <UseCasesSection />
        <HowItWorksSection />
        <SecuritySection />
        <BlockchainSection />
        <TestimonialSection />
        <ComparisonTeaser />
        <BetaSection />
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
          <a href="https://theresanaiforthat.com/ai/privaro/?ref=featured&v=12784591" target="_blank" rel="nofollow">
            <img width="150" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600" alt="Featured on There's An AI For That" className="inline-block max-w-full h-auto" loading="lazy" decoding="async" />
          </a>
          <a href="https://www.producthunt.com/products/privaro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-privaro-2" target="_blank" rel="noopener noreferrer">
            <img
              alt="Privaro - Runtime PII detection and governance proxy for LLMs | Product Hunt"
              width="210"
              height="46"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1252180&theme=dark&t=1789636604895"
              className="inline-block max-w-full h-auto"
              loading="lazy"
              decoding="async"
            />
          </a>
          <a href="https://launchnest.io/p/privaro" target="_blank" rel="noopener noreferrer" title="privaro.ai — Domain Rating by LaunchNest">
            <img
              alt="privaro.ai Domain Rating"
              width="160"
              src="https://launchnest.io/api/badge/dr?domain=privaro.ai&style=normal&shape=round&color=dark"
              className="inline-block max-w-full h-auto"
              loading="lazy"
              decoding="async"
            />
          </a>
          <a href="https://alternativeto.net/software/privaro-ai/about/?utm_source=badge&utm_medium=referral" target="_blank" rel="noopener noreferrer">
            <img
              src="/alternativeto-badge.svg"
              alt="Privaro.ai | AlternativeTo"
              width="171"
              height="58"
              className="inline-block max-w-full h-auto"
              loading="lazy"
              decoding="async"
            />
          </a>
        </section>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
