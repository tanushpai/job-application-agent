"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Sparkles, UploadCloud, ArrowRight } from "lucide-react";
import { ProfileCompleteness } from "@/lib/profile-utils";

interface ProfileCompletenessCardProps {
  completeness: ProfileCompleteness;
  onUploadClick?: () => void;
}

export function ProfileCompletenessCard({
  completeness,
  onUploadClick,
}: ProfileCompletenessCardProps) {
  const { percentage, color, badgeLabel, sections } = completeness;

  // SVG Circular Math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

  // Color config based on %
  const colorMap = {
    red: {
      stroke: "stroke-red-500",
      text: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    amber: {
      stroke: "stroke-amber-500",
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    emerald: {
      stroke: "stroke-emerald-500",
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  }[color as "red" | "amber" | "emerald"] || {
    stroke: "stroke-emerald-500",
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Profile Strength
          </h3>
          <p className="text-xs text-muted-foreground">
            Higher completeness boosts AI match rate
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap.bg} ${colorMap.text} border ${colorMap.border}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Circular Progress Gauge */}
      <div className="flex items-center justify-center py-2">
        <div className="relative flex items-center justify-center size-32">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-muted"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className={`${colorMap.stroke} transition-all duration-700 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Central Label */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-extrabold ${colorMap.text}`}>
              {percentage}%
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Complete
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Section Checklist
        </h4>
        <div className="space-y-2 text-xs">
          {sections.map((section) => (
            <div
              key={section.name}
              className="flex items-center justify-between p-2 rounded-xl bg-muted/40"
            >
              <div className="flex items-center gap-2">
                {section.completed ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/50 shrink-0" />
                )}
                <span
                  className={
                    section.completed
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {section.name}
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                +{section.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="pt-2">
        {onUploadClick ? (
          <button
            onClick={onUploadClick}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UploadCloud className="size-4" />
            <span>Re-Parse Resume with AI</span>
          </button>
        ) : (
          <Link
            href="/dashboard/resume"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4 text-amber-400" />
            <span>Manage Uploaded Resumes</span>
            <ArrowRight className="size-3.5 ml-auto" />
          </Link>
        )}
      </div>
    </div>
  );
}
