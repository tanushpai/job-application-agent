"use client";

import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Will ATS systems reject AI-tailored resumes?",
    a: "No. JobBuddy AI generates resumes strictly adhering to Jake's Resume standard (Overleaf / LaTeX ATS gold standard). It uses clean single-column serif formatting, no tables or complex SVG graphics that confuse parsers, and produces vector text PDFs with 100% text fidelity for Taleo, Workday, and Greenhouse.",
  },
  {
    q: "Does the autonomous agent work on Workday and Greenhouse?",
    a: "Yes. Our Playwright browser agent features dedicated adapters that navigate multi-step Workday portals, Greenhouse EEOC dropdowns, Lever custom questions, and Ashby application forms without manual copy-pasting.",
  },
  {
    q: "Can I review applications before they are submitted?",
    a: "Absolutely! You can choose between 'Human-in-the-Loop' mode (where the agent pre-fills the form, generates the tailored resume, and awaits your 1-click confirmation) or 'Full Autopilot' mode for vetted trusted companies.",
  },
  {
    q: "How does the AI Project Context Hub work?",
    a: "You can save raw bullet points, architecture notes, and metrics for your personal and work projects. When tailoring a resume for a job, Google Gemini AI pulls relevant project context and writes impact-driven Google XYZ formula bullet points targeted to the job description.",
  },
  {
    q: "Can I add custom company career pages that aren't on job boards?",
    a: "Yes. In the Connectors Hub, you can paste any direct company career URL (like Stripe, Nvidia, or OpenAI). Our multi-source scraper intercepts background JSON API responses and monitors new postings automatically.",
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="faq-section">
      <div className="section-header">
        <div className="section-badge">
          <Search className="size-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-desc">
          Everything you need to know about ATS compliance, privacy, and our autonomous agent.
        </p>
      </div>

      <div className="faq-list">
        {FAQS.map((faq, idx) => (
          <div key={idx} className={`faq-item ${openFaq === idx ? "open" : ""}`}>
            <button
              className="faq-trigger"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              aria-expanded={openFaq === idx}
            >
              <span>{faq.q}</span>
              <ChevronDown className="faq-icon size-4 flex-shrink-0" />
            </button>
            {openFaq === idx && <div className="faq-content">{faq.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
