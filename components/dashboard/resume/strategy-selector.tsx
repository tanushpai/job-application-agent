import React from "react";
import { Zap, BarChart3, Cpu, Award } from "lucide-react";
import { TailoringPreset } from "@/types/resume";

interface StrategySelectorProps {
  value: TailoringPreset;
  onChange: (val: TailoringPreset) => void;
}

const PRESETS: Array<{
  id: TailoringPreset;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: "ats_optimized",
    label: "ATS Gold Standard",
    desc: "Optimizes exact keyword matches for Taleo, Workday, and Greenhouse parsers.",
    icon: Zap,
  },
  {
    id: "metric_heavy",
    label: "Metric & Impact Heavy",
    desc: "Emphasizes Google XYZ formula with revenue, percentage, and scale metrics.",
    icon: BarChart3,
  },
  {
    id: "technical_depth",
    label: "Technical Architecture",
    desc: "Highlights system design, distributed infrastructure, and frameworks.",
    icon: Cpu,
  },
  {
    id: "executive",
    label: "Leadership & Scope",
    desc: "Emphasizes cross-functional leadership, mentoring, and roadmap delivery.",
    icon: Award,
  },
];

export function StrategySelector({ value, onChange }: StrategySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PRESETS.map((p) => {
        const Icon = p.icon;
        const isSelected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              isSelected
                ? "bg-primary/10 border-primary shadow-sm"
                : "bg-card border-border hover:border-border/80 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className={`size-4 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {p.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {p.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
