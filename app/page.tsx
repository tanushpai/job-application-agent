"use client";

import React, { useEffect } from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { AtsTicker } from "@/components/landing/ats-ticker";
import { InteractiveSimulator } from "@/components/landing/interactive-simulator";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { AtsComparisonSection } from "@/components/landing/ats-comparison";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/landing-footer";
import "./landing.css";

export default function LandingPage() {
  useEffect(() => {
    document.title = "JobBuddy AI — Autonomous AI Job Application Agent & Jake's Resume Studio";
  }, []);

  return (
    <div className="landing-body">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <LandingNavbar />

      <main>
        <HeroSection />
        <AtsTicker />
        <InteractiveSimulator />
        <HowItWorksSection />
        <FeaturesGrid />
        <AtsComparisonSection />
        <PricingSection />
        <FaqSection />
        <CtaBanner />
      </main>

      <LandingFooter />
    </div>
  );
}
