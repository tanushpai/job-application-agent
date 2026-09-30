import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="section-header">
        <div className="section-badge">
          <Sparkles className="size-3.5" />
          <span>Simple Pricing</span>
        </div>
        <h2 className="section-title">Invest in Your Career Velocity</h2>
        <p className="section-desc">
          Land your next high-paying offer months faster. Cancel anytime with a 14-day guarantee.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className="price-card">
          <div>
            <h3 className="price-title">Scout Free</h3>
            <p className="price-desc">Perfect for testing the waters and manual resume tailoring.</p>
            <div className="price-val-wrap">
              <span className="price-currency">$</span>
              <span className="price-amount">0</span>
              <span className="price-period">/ month</span>
            </div>
            <ul className="price-features-list">
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>3 Tailored Resumes / month</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Jake&apos;s ATS PDF Generator</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Basic Job Board Scraper</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Kanban Application Tracker</span>
              </li>
            </ul>
          </div>
          <Link href="/dashboard" className="price-btn price-btn-secondary">
            Get Started Free
          </Link>
        </div>

        {/* Pro Tier (Featured) */}
        <div className="price-card featured">
          <span className="featured-badge">Most Popular</span>
          <div>
            <h3 className="price-title">Autopilot Pro</h3>
            <p className="price-desc">Complete automation for active tech job seekers.</p>
            <div className="price-val-wrap">
              <span className="price-currency">$</span>
              <span className="price-amount">29</span>
              <span className="price-period">/ month</span>
            </div>
            <ul className="price-features-list">
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-indigo-400" />
                <span><strong>Unlimited</strong> Tailored Resumes</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-indigo-400" />
                <span><strong>100</strong> Autonomous Auto-Applies/mo</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-indigo-400" />
                <span>Workday, Greenhouse &amp; Lever Adapters</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-indigo-400" />
                <span>AI Project Context Hub &amp; XYZ Formula</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-indigo-400" />
                <span>Priority Gemini 2.5 AI Model</span>
              </li>
            </ul>
          </div>
          <Link href="/dashboard/billing" className="price-btn price-btn-primary">
            Start 7-Day Free Trial
          </Link>
        </div>

        {/* Enterprise Tier */}
        <div className="price-card">
          <div>
            <h3 className="price-title">Career Autopilot Max</h3>
            <p className="price-desc">For aggressive applicants targeting tier-1 tech &amp; leadership roles.</p>
            <div className="price-val-wrap">
              <span className="price-currency">$</span>
              <span className="price-amount">79</span>
              <span className="price-period">/ month</span>
            </div>
            <ul className="price-features-list">
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span><strong>Unlimited</strong> Auto-Applications</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Custom Career Scraper by URL</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>AI Interview Preparation Hub</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Dedicated Proxy IP Pool (Anti-Detection)</span>
              </li>
              <li className="price-feature-item">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>1-on-1 Strategy Onboarding</span>
              </li>
            </ul>
          </div>
          <Link href="/dashboard/billing" className="price-btn price-btn-secondary">
            Upgrade to Max
          </Link>
        </div>
      </div>
    </section>
  );
}
