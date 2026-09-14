import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { InteractiveSandbox } from "@/components/marketing/interactive-sandbox";
import { FeaturePillars } from "@/components/marketing/feature-pillars";
import { ArchitectureSection } from "@/components/marketing/architecture-section";
import { ComparisonMatrix } from "@/components/marketing/comparison-matrix";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      {/* Sticky Marketing Header */}
      <MarketingNavbar />

      {/* Main Marketing Content */}
      <main className="flex-1">
        {/* Hero Section with Call to Actions */}
        <HeroSection />

        {/* Live Interactive Sandbox (Zero-Login Demo) */}
        <div id="sm2">
          <InteractiveSandbox />
        </div>

        {/* 6 Core Feature Pillars */}
        <FeaturePillars />

        {/* 5-Stage Ingestion Pipeline & Defensive Parser Architecture */}
        <ArchitectureSection />

        {/* Competitive Comparison Matrix */}
        <ComparisonMatrix />

        {/* Pricing & Free Tier Section */}
        <PricingSection />

        {/* FAQ Accordion */}
        <FAQSection />
      </main>

      {/* Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
