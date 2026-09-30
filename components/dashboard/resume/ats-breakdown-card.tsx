import React from "react";
import { Award, Zap, Cpu, BarChart3, CheckCircle2, AlertCircle } from "lucide-react";
import { AtsScoreBreakdown } from "@/types/resume";

interface AtsBreakdownCardProps {
  atsScore: number;
  scoreBreakdown?: AtsScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export function AtsBreakdownCard({
  atsScore,
  scoreBreakdown,
  matchedSkills,
  missingSkills,
  recommendations,
}: AtsBreakdownCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            ATS Compatibility Score
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-3xl font-extrabold ${
                atsScore >= 85
                  ? "text-emerald-500"
                  : atsScore >= 70
                  ? "text-amber-500"
                  : "text-destructive"
              }`}
            >
              {atsScore}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100</span>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            atsScore >= 85
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : atsScore >= 70
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {atsScore >= 85
            ? "High Interview Probability"
            : atsScore >= 70
            ? "Solid Keyword Alignment"
            : "Keyword Match Needs Polish"}
        </div>
      </div>

      {scoreBreakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border text-center">
          <div className="p-2 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="size-3 text-amber-400" /> Keyword
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {scoreBreakdown.keywordMatch}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <BarChart3 className="size-3 text-blue-400" /> Relevance
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {scoreBreakdown.experienceRelevance}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Cpu className="size-3 text-purple-400" /> Skills
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {scoreBreakdown.skillsAlignment}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Award className="size-3 text-emerald-400" /> Format
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {scoreBreakdown.formattingReadiness}%
            </div>
          </div>
        </div>
      )}

      {/* Matched vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Matched Keywords ({matchedSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.slice(0, 10).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {missingSkills.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-amber-500 flex items-center gap-1">
              <AlertCircle className="size-3.5" /> Suggested Additions ({missingSkills.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.slice(0, 8).map((skill, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-semibold text-foreground mb-1.5">
            Recruiter &amp; ATS Optimization Tips:
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
