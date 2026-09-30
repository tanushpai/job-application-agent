import React from "react";
import { Layers } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-header">
        <div className="section-badge">
          <Layers className="size-3.5" />
          <span>Streamlined Workflow</span>
        </div>
        <h2 className="section-title">How JobBuddy AI Works</h2>
        <p className="section-desc">
          From discovering unadvertised roles to tailoring resumes and submitting verified
          applications in four intelligent steps.
        </p>
      </div>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-num-badge">01</div>
          <h3 className="step-card-title">Project &amp; Context Hub</h3>
          <p className="step-card-desc">
            Store your raw project notes and achievements. Gemini AI turns them into
            high-impact Google XYZ formula bullet points with quantified business metrics.
          </p>
        </div>

        <div className="step-card">
          <div className="step-num-badge">02</div>
          <h3 className="step-card-title">Universal ATS Scouting</h3>
          <p className="step-card-desc">
            Our multi-source scraper monitors Workday, Greenhouse, Lever, and custom company
            URLs to find fresh roles matching your title, salary, and location filters.
          </p>
        </div>

        <div className="step-card">
          <div className="step-num-badge">03</div>
          <h3 className="step-card-title">Jake&apos;s AI Resume Tailor</h3>
          <p className="step-card-desc">
            For every targeted role, Gemini AI matches required keywords and generates
            a single-column Overleaf-standard Jake&apos;s Resume compiled to clean vector PDF.
          </p>
        </div>

        <div className="step-card">
          <div className="step-num-badge">04</div>
          <h3 className="step-card-title">Playwright Form Auto-Fill</h3>
          <p className="step-card-desc">
            Our headless browser agent completes multi-page forms, answers screening
            questions, attaches the tailored PDF, and logs status to your Kanban tracker.
          </p>
        </div>
      </div>
    </section>
  );
}
