"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, CheckCircle2 } from "lucide-react";

export function InteractiveSimulator() {
  const [simTab, setSimTab] = useState<"resume" | "agent" | "scraper">("resume");

  return (
    <section className="simulator-section">
      <div className="section-header">
        <div className="section-badge">
          <Terminal className="size-3.5" />
          <span>Live Interactive Demo</span>
        </div>
        <h2 className="section-title">See JobBuddy AI in Action</h2>
        <p className="section-desc">
          Watch how our multi-agent architecture monitors job boards, writes tailored
          LaTeX resumes, and navigates complex application forms with zero friction.
        </p>
      </div>

      <div className="sim-window">
        <div className="sim-window-header">
          <div className="sim-dots">
            <span className="sim-dot dot-red" />
            <span className="sim-dot dot-yellow" />
            <span className="sim-dot dot-green" />
          </div>

          <div className="sim-tab-buttons">
            <button
              className={`sim-tab-btn ${simTab === "resume" ? "active" : ""}`}
              onClick={() => setSimTab("resume")}
            >
              📄 Jake&apos;s ATS Resume
            </button>
            <button
              className={`sim-tab-btn ${simTab === "agent" ? "active" : ""}`}
              onClick={() => setSimTab("agent")}
            >
              🤖 Autonomous Agent Form
            </button>
            <button
              className={`sim-tab-btn ${simTab === "scraper" ? "active" : ""}`}
              onClick={() => setSimTab("scraper")}
            >
              🔍 Multi-Source Scraper
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-mono hidden md:block">
            jobbuddy-agent-v2.5 // PID: 8094
          </div>
        </div>

        <div className="sim-body-grid">
          {/* Left Terminal Stream */}
          <div className="sim-terminal">
            <div className="terminal-title">{"// Live Agent Execution Stream"}</div>
            <div className="terminal-line">
              <span className="line-time">[00:01]</span>
              <span className="line-tag-scout">SCOUT</span>
              <span className="text-zinc-300">
                Detected new opening: <strong>Staff Software Engineer</strong> @ Stripe (Workday)
              </span>
            </div>
            <div className="terminal-line">
              <span className="line-time">[00:03]</span>
              <span className="line-tag-tailor">GEMINI</span>
              <span className="text-zinc-300">
                Extracted 14 keywords. Formatted Jake&apos;s LaTeX Resume (Match: 96%)
              </span>
            </div>
            <div className="terminal-line">
              <span className="line-time">[00:06]</span>
              <span className="line-tag-agent">PLAYWRIGHT</span>
              <span className="text-zinc-300">
                Attached compiled vector PDF. Auto-filling EEOC &amp; custom questions...
              </span>
            </div>
            <div className="terminal-line">
              <span className="line-time">[00:09]</span>
              <span className="line-tag-done">SUCCESS</span>
              <span className="text-emerald-400 font-semibold">
                Application #2,481 submitted &amp; tracked in Pipeline ✅
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
              <span>Status: Autonomous Idle</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                Live Socket Connected
              </span>
            </div>
          </div>

          {/* Right Interactive Preview Pane */}
          <div className="sim-preview-pane">
            {simTab === "resume" && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      Jake&apos;s LaTeX Resume (ATS Gold Standard)
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                      ATS 96/100
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">Single-Column Serif</span>
                </div>

                <div className="bg-white text-zinc-900 rounded-lg p-5 font-serif text-[11px] leading-relaxed shadow-lg flex-1 overflow-hidden select-none">
                  <div className="text-center pb-2 border-b border-zinc-300">
                    <h3 className="font-bold text-[14px] uppercase tracking-wider text-black">
                      Alex Chen
                    </h3>
                    <p className="text-zinc-600 text-[10px]">
                      alex.chen@email.com | (555) 234-5678 | github.com/alexchen | linkedin.com/in/alexchen
                    </p>
                  </div>

                  <div className="mt-2">
                    <h4 className="font-bold uppercase text-[11px] text-zinc-900 border-b border-zinc-400 pb-0.5 mb-1">
                      Technical Skills
                    </h4>
                    <p className="text-[10.5px]">
                      <strong>Languages:</strong> TypeScript, Python, Go, Java, SQL, Rust
                    </p>
                    <p className="text-[10.5px]">
                      <strong>Frameworks &amp; Tools:</strong> Next.js, React, Node.js, Playwright, PostgreSQL, Docker, AWS
                    </p>
                  </div>

                  <div className="mt-2">
                    <h4 className="font-bold uppercase text-[11px] text-zinc-900 border-b border-zinc-400 pb-0.5 mb-1">
                      Experience
                    </h4>
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Senior Full-Stack Engineer — CloudScale Labs</span>
                      <span className="font-normal text-zinc-600">2023 – Present</span>
                    </div>
                    <ul className="list-disc list-inside text-zinc-700 text-[10px] space-y-0.5 mt-0.5">
                      <li>
                        Architected high-throughput microservices handling 25M+ requests/day with 99.99% uptime.
                      </li>
                      <li>
                        Optimized database latency by 42% via automated Redis indexing and connection pooling.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {simTab === "agent" && (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="font-semibold text-sm text-white">
                      Autonomous Form Auto-Fill State
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                      Playwright Active
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-2.5 rounded bg-zinc-900/90 border border-white/5">
                      <span className="text-zinc-500">Target URL:</span>{" "}
                      <span className="text-blue-400">https://stripe.wd1.myworkdayjobs.com/...</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-900/90 border border-white/5">
                      <span className="text-zinc-500">Resume Attached:</span>{" "}
                      <span className="text-emerald-400">alex_chen_tailored_stripe_2026.pdf (Vector PDF)</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-900/90 border border-white/5">
                      <span className="text-zinc-500">Custom Question #1:</span>{" "}
                      <span className="text-zinc-300">&quot;Years of experience with distributed systems?&quot; &rarr; </span>
                      <span className="text-amber-400">&quot;5+ years building multi-region services&quot;</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="size-4 flex-shrink-0" />
                  <span>All validation checks passed. Zero human intervention needed.</span>
                </div>
              </div>
            )}

            {simTab === "scraper" && (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="font-semibold text-sm text-white">
                      Multi-Platform Career Scraper Feed
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-mono">
                      14 Sources Synced
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Nvidia</span>
                        <span className="text-zinc-400">AI Infrastructure Engineer</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[11px]">Workday // $185k-$230k</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Vercel</span>
                        <span className="text-zinc-400">Frontend Platform Architect</span>
                      </div>
                      <span className="text-purple-400 font-mono text-[11px]">Ashby // Remote</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Coinbase</span>
                        <span className="text-zinc-400">Staff Backend Engineer</span>
                      </div>
                      <span className="text-blue-400 font-mono text-[11px]">Greenhouse // $210k</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-400 flex items-center justify-between">
                  <span>Playwright network API interception enabled</span>
                  <Link href="/dashboard/connectors" className="text-blue-400 hover:underline">
                    Add Custom URL &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
