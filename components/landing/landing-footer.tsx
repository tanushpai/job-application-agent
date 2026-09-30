import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="global-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link href="/" className="brand-logo">
              <div className="brand-icon-box">
                <Bot className="size-5" />
              </div>
              <span>JobBuddy AI</span>
            </Link>
            <p className="footer-brand-desc">
              Autonomous AI job application agent &amp; Jake&apos;s ATS Resume tailoring studio powered by Google Gemini 2.5 and Playwright.
            </p>
            <div className="footer-status-pill">
              <span className="pulsing-dot" />
              <span>All Agent Systems Operational</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/dashboard/jobs" className="footer-link-item">
                  AI Job Agent
                </Link>
              </li>
              <li>
                <Link href="/dashboard/resume" className="footer-link-item">
                  Jake&apos;s Resume Studio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/connectors" className="footer-link-item">
                  Career Connectors
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="footer-link-item">
                  Project Context Hub
                </Link>
              </li>
              <li>
                <Link href="/dashboard/application-status" className="footer-link-item">
                  Application Pipeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrations Column */}
          <div>
            <h4 className="footer-col-title">ATS Engines</h4>
            <ul className="footer-link-list">
              <li>
                <span className="footer-link-item">Workday Adapter</span>
              </li>
              <li>
                <span className="footer-link-item">Greenhouse API</span>
              </li>
              <li>
                <span className="footer-link-item">Lever Automation</span>
              </li>
              <li>
                <span className="footer-link-item">Ashby Direct</span>
              </li>
              <li>
                <span className="footer-link-item">SmartRecruiters</span>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="#how-it-works" className="footer-link-item">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="footer-link-item">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="#faq" className="footer-link-item">
                  ATS FAQ
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="footer-link-item">
                  Agent Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="footer-col-title">Legal &amp; Trust</h4>
            <ul className="footer-link-list">
              <li>
                <span className="footer-link-item">Privacy Policy</span>
              </li>
              <li>
                <span className="footer-link-item">Terms of Service</span>
              </li>
              <li>
                <span className="footer-link-item">Security &amp; Encryption</span>
              </li>
              <li>
                <span className="footer-link-item">Anti-Detection Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} JobBuddy AI Inc. All rights reserved.
          </div>

          <div className="footer-social-row">
            <a href="#" className="footer-social-icon" aria-label="GitHub">
              <i className="fa-brands fa-github" />
            </a>
            <a href="#" className="footer-social-icon" aria-label="Twitter / X">
              <i className="fa-brands fa-x-twitter" />
            </a>
            <a href="#" className="footer-social-icon" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin" />
            </a>
            <a href="#" className="footer-social-icon" aria-label="Discord">
              <i className="fa-brands fa-discord" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
