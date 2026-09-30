"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bot, ArrowRight, FileText } from "lucide-react";

interface StatItem {
  target: number;
  suffix: string;
  decimals: number;
  label: string;
}

const STATS_DATA: StatItem[] = [
  { target: 45, suffix: "s", decimals: 0, label: "Form Auto-Fill Speed" },
  { target: 98.8, suffix: "%", decimals: 1, label: "ATS Parse Pass Rate" },
  { target: 24, suffix: "/7", decimals: 0, label: "Autonomous Scouting" },
  { target: 10, suffix: "k+", decimals: 0, label: "Live Jobs Tracked" },
];

export function HeroSection() {
  const [stats, setStats] = useState<number[]>([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) return;

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const startCounters = () => {
      hasAnimatedRef.current = true;
      STATS_DATA.forEach((stat, i) => {
        const startDelay = 200 + i * 80;
        const duration = 1400;

        setTimeout(() => {
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            const currentVal = easeOutCubic(progress) * stat.target;

            setStats((prev) => {
              const next = [...prev];
              next[i] = currentVal;
              return next;
            });

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setStats((prev) => {
                const next = [...prev];
                next[i] = stat.target;
                return next;
              });
            }
          };
          requestAnimationFrame(step);
        }, startDelay);
      });
    };

    if ("IntersectionObserver" in window && statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimatedRef.current) {
            startCounters();
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(statsRef.current);
      return () => observer.disconnect();
    } else {
      startCounters();
    }
  }, []);

  return (
    <section className="hero-section">
      <video className="hero-video-bg" autoPlay muted loop playsInline>
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>
      <div className="hero-gradient-overlay" />

      <div className="hero-content">
        <div className="hero-pill-badge">
          <span className="pulsing-dot" />
          <span>Powered by Google Gemini 2.5 &amp; Playwright Engine</span>
        </div>

        <h1 className="hero-headline">
          Land Your Dream Job on <br />
          <span className="gradient-text">Complete Autopilot</span>
        </h1>

        <p className="hero-subhead">
          JobBuddy AI scouts 10,000+ live jobs across Workday, Greenhouse &amp; Lever,
          tailors your resume into the <strong>ATS Gold-Standard Jake&apos;s Format</strong>,
          and submits verified applications while you sleep.
        </p>

        <div className="hero-cta-group">
          <Link href="/dashboard/jobs" className="hero-btn-primary">
            <Bot className="size-4" />
            <span>Launch AI Job Agent</span>
            <ArrowRight className="size-4 ml-1" />
          </Link>

          <Link href="/dashboard/resume" className="hero-btn-secondary">
            <FileText className="size-4 text-blue-400" />
            <span>Try Jake&apos;s Resume Studio</span>
          </Link>
        </div>

        <div ref={statsRef} className="hero-stats-grid">
          {STATS_DATA.map((item, idx) => (
            <div key={idx} className="hero-stat-item">
              <div className="hero-stat-val">
                {item.decimals > 0
                  ? stats[idx].toFixed(item.decimals)
                  : Math.round(stats[idx])}
                <span className="text-blue-400 font-semibold">{item.suffix}</span>
              </div>
              <div className="hero-stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
