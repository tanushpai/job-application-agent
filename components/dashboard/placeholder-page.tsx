import React from "react";
import { type LucideIcon, Sparkles } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  badgeText = "Blank Page • Content Coming Soon",
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border/80">
              <Sparkles className="size-3 text-primary" />
              <span>JobBuddy AI</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Modern Blank Slate / Placeholder Card */}
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-sm sm:p-12 shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground shadow-inner mb-4 ring-1 ring-border/50">
          <Icon className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description} This module is scaffolded and ready for feature implementation.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground border border-border/50">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span>{badgeText}</span>
        </div>
      </div>
    </div>
  );
}
