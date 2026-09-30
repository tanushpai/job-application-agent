import React from "react";
import { Zap, FileText, Bot, Code2, Globe, BarChart3, ShieldCheck } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section id="features" className="features-section">
      <div className="section-header">
        <div className="section-badge">
          <Zap className="size-3.5" />
          <span>Platform Capabilities</span>
        </div>
        <h2 className="section-title">Engineered for Maximum Offer Velocity</h2>
        <p className="section-desc">
          Everything you need to automate tedious applications and double your interview callback rate.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrap icon-emerald">
            <FileText className="size-6" />
          </div>
          <h3 className="feature-title">Jake&apos;s ATS Gold Standard</h3>
          <p className="feature-desc">
            Built on the renowned Overleaf LaTeX template with perfect serif typography,
            zero parse errors, and 98.8% automated ATS scanner pass rate.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap icon-purple">
            <Bot className="size-6" />
          </div>
          <h3 className="feature-title">Autonomous Browser Agent</h3>
          <p className="feature-desc">
            Playwright agent intelligently solves dropdowns, uploads files, fills Workday
            account credentials, and bypasses cumbersome multi-page flows.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap icon-blue">
            <Code2 className="size-6" />
          </div>
          <h3 className="feature-title">AI Project Context Hub</h3>
          <p className="feature-desc">
            Store deep technical context for all your projects. AI automatically selects
            the most relevant projects and generates tailored bullet points per job.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap icon-amber">
            <Globe className="size-6" />
          </div>
          <h3 className="feature-title">Universal Scraper &amp; Connectors</h3>
          <p className="feature-desc">
            Add any custom company career page URL or sync directly with Greenhouse,
            Workday, Ashby, and Lever career feeds via background API interception.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap icon-rose">
            <BarChart3 className="size-6" />
          </div>
          <h3 className="feature-title">Kanban Application Pipeline</h3>
          <p className="feature-desc">
            Track applied jobs, interview invitations, technical screens, and offers in
            a centralized real-time dashboard with response rate analytics.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap icon-cyan">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="feature-title">Human-in-the-Loop Safety</h3>
          <p className="feature-desc">
            Never submit blind applications. Preview every AI-tailored resume and form answer
            with one-click approvals before final submission.
          </p>
        </div>
      </div>
    </section>
  );
}
