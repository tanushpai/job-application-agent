"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Sparkles, Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`nav-container ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="brand-logo">
            <div className="brand-icon-box">
              <Bot className="size-5" />
            </div>
            <span className="font-extrabold tracking-tight">JobBuddy</span>
            <span className="brand-badge">AI 2.5</span>
          </Link>

          <nav className="nav-links-pill" aria-label="Desktop Navigation">
            <Link href="#features" className="nav-link-item">
              Features
            </Link>
            <Link href="#how-it-works" className="nav-link-item">
              How It Works
            </Link>
            <Link href="/dashboard/resume" className="nav-link-item">
              Jake&apos;s Resume Studio
            </Link>
            <Link href="/dashboard/connectors" className="nav-link-item">
              Connectors
            </Link>
            <Link href="#pricing" className="nav-link-item">
              Pricing
            </Link>
            <Link href="#faq" className="nav-link-item">
              FAQ
            </Link>
          </nav>

          <div className="nav-actions">
            <Link href="/dashboard" className="btn-ghost-nav">
              Sign In
            </Link>
            <Link href="/dashboard/jobs" className="btn-primary-nav">
              <Sparkles className="size-3.5 text-blue-600 fill-blue-600" />
              <span>Launch Autopilot</span>
            </Link>
          </div>

          <button
            className="mobile-nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-sheet">
          <div className="mobile-sheet-header">
            <div className="brand-logo">
              <div className="brand-icon-box">
                <Bot className="size-5" />
              </div>
              <span>JobBuddy AI</span>
            </div>
            <button
              className="mobile-nav-toggle"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="mobile-sheet-links">
            <Link href="#features" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              How It Works
            </Link>
            <Link href="/dashboard/resume" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              Jake&apos;s Resume Studio
            </Link>
            <Link href="/dashboard/jobs" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              AI Job Agent
            </Link>
            <Link href="/dashboard/connectors" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              Career Connectors
            </Link>
            <Link href="#pricing" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="#faq" className="mobile-sheet-link" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>

            <div className="pt-6 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full py-3 text-center bg-white/10 text-white rounded-xl font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Sign In to Dashboard
              </Link>
              <Link
                href="/dashboard/jobs"
                className="w-full py-3 text-center bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <Sparkles className="size-4 text-blue-600 fill-blue-600" />
                Launch Autopilot Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
