import React from "react";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { ExperienceItem } from "@/types/profile";

interface ExperienceTabProps {
  experiences: ExperienceItem[];
  setExperiences: React.Dispatch<React.SetStateAction<ExperienceItem[]>>;
}

export function ExperienceTab({ experiences, setExperiences }: ExperienceTabProps) {
  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
        highlights: [""],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: unknown) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addHighlight = (expIndex: number) => {
    const updated = [...experiences];
    const currentHighlights = updated[expIndex].highlights || [];
    updated[expIndex].highlights = [...currentHighlights, ""];
    setExperiences(updated);
  };

  const updateHighlight = (expIndex: number, hlIndex: number, text: string) => {
    const updated = [...experiences];
    const currentHighlights = [...(updated[expIndex].highlights || [])];
    currentHighlights[hlIndex] = text;
    updated[expIndex].highlights = currentHighlights;
    setExperiences(updated);
  };

  const removeHighlight = (expIndex: number, hlIndex: number) => {
    const updated = [...experiences];
    const currentHighlights = (updated[expIndex].highlights || []).filter((_, i) => i !== hlIndex);
    updated[expIndex].highlights = currentHighlights;
    setExperiences(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            Work Experience
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add your professional experience. Use bullet points with quantified metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="size-3.5" />
          Add Role
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <Briefcase className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No experience listed yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add your previous software engineering or professional roles to power Jake&apos;s ATS Resume.
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add First Experience
          </button>
        </div>
      ) : (
        experiences.map((exp, expIdx) => (
          <div key={expIdx} className="bg-card border border-border rounded-xl p-6 shadow-sm relative group">
            <button
              type="button"
              onClick={() => removeExperience(expIdx)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Remove experience"
            >
              <Trash2 className="size-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title *</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(expIdx, "title", e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(expIdx, "company", e.target.value)}
                  placeholder="e.g. Stripe, Inc."
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <input
                  type="text"
                  value={exp.location || ""}
                  onChange={(e) => updateExperience(expIdx, "location", e.target.value)}
                  placeholder="San Francisco, CA / Remote"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate || ""}
                    onChange={(e) => updateExperience(expIdx, "startDate", e.target.value)}
                    placeholder="Aug 2022"
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    {exp.isCurrent ? "End Date" : "End Date"}
                  </label>
                  <input
                    type="text"
                    disabled={exp.isCurrent}
                    value={exp.isCurrent ? "Present" : exp.endDate || ""}
                    onChange={(e) => updateExperience(expIdx, "endDate", e.target.value)}
                    placeholder="Present"
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exp.isCurrent || false}
                  onChange={(e) => updateExperience(expIdx, "isCurrent", e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="text-xs text-foreground font-medium">I currently work here</span>
              </label>
            </div>

            {/* Bullet point achievements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Key Achievements &amp; Impact (Google XYZ Format)
                </label>
                <button
                  type="button"
                  onClick={() => addHighlight(expIdx)}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Bullet
                </button>
              </div>

              {(exp.highlights || []).map((hl, hlIdx) => (
                <div key={hlIdx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground select-none">•</span>
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => updateHighlight(expIdx, hlIdx, e.target.value)}
                    placeholder="Accomplished [X] as measured by [Y], by doing [Z] (e.g. Scaled API throughput by 40%...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(expIdx, hlIdx)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
