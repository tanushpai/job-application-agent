import React from "react";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="cta-banner-section">
      <div className="cta-banner-card">
        <h2 className="cta-banner-title">Ready to Stop Applying Manually?</h2>
        <p className="cta-banner-sub">
          Join thousands of software engineers, product managers, and data scientists
          landing offers with JobBuddy AI. Set up in under 3 minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
          <Link href="/dashboard/jobs" className="hero-btn-primary">
            <Bot className="size-4" />
            <span>Launch Autopilot Free</span>
            <ArrowRight className="size-4 ml-1" />
          </Link>
          <Link href="/dashboard/resume" className="hero-btn-secondary">
            <span>Create ATS Resume</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
