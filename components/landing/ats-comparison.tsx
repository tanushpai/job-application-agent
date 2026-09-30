import React from "react";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export function AtsComparisonSection() {
  return (
    <section className="comparison-section">
      <div className="section-header">
        <div className="section-badge">
          <ShieldCheck className="size-3.5" />
          <span>Why Formatting Matters</span>
        </div>
        <h2 className="section-title">Standard Resumes vs. JobBuddy AI</h2>
        <p className="section-desc">
          75% of resumes are discarded by ATS parsers before a human ever reads them.
          Here is why Jake&apos;s format and Gemini keyword matching make the difference.
        </p>
      </div>

      <div className="comp-table-card">
        <div className="comp-row comp-header-row">
          <div>Feature / Standard</div>
          <div>Generic Canva/Word Resumes</div>
          <div>JobBuddy AI (Jake&apos;s LaTeX)</div>
        </div>

        <div className="comp-row">
          <div className="comp-feature-cell">ATS Text Parsing Accuracy</div>
          <div className="comp-bad-cell">
            <XCircle className="size-4" />
            <span>45% – 60% (Scrambled)</span>
          </div>
          <div className="comp-good-cell">
            <CheckCircle2 className="size-4" />
            <span>98.8% (Clean Vector)</span>
          </div>
        </div>

        <div className="comp-row">
          <div className="comp-feature-cell">Job Keyword Alignment</div>
          <div className="comp-bad-cell">
            <XCircle className="size-4" />
            <span>Static / Generic</span>
          </div>
          <div className="comp-good-cell">
            <CheckCircle2 className="size-4" />
            <span>Dynamic Gemini JD Match</span>
          </div>
        </div>

        <div className="comp-row">
          <div className="comp-feature-cell">Workday &amp; Taleo Compatibility</div>
          <div className="comp-bad-cell">
            <XCircle className="size-4" />
            <span>Fails on tables/columns</span>
          </div>
          <div className="comp-good-cell">
            <CheckCircle2 className="size-4" />
            <span>100% Single-Column Serif</span>
          </div>
        </div>

        <div className="comp-row">
          <div className="comp-feature-cell">Application Time Per Job</div>
          <div className="comp-bad-cell">
            <XCircle className="size-4" />
            <span>15 – 30 Minutes</span>
          </div>
          <div className="comp-good-cell">
            <CheckCircle2 className="size-4" />
            <span>Under 45 Seconds</span>
          </div>
        </div>

        <div className="comp-row">
          <div className="comp-feature-cell">Project Context Accuracy</div>
          <div className="comp-bad-cell">
            <XCircle className="size-4" />
            <span>Generic AI hallucinations</span>
          </div>
          <div className="comp-good-cell">
            <CheckCircle2 className="size-4" />
            <span>Grounded in your Context Hub</span>
          </div>
        </div>
      </div>
    </section>
  );
}
