import React from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { EducationItem } from "@/types/profile";

interface EducationTabProps {
  educations: EducationItem[];
  setEducations: React.Dispatch<React.SetStateAction<EducationItem[]>>;
}

export function EducationTab({ educations, setEducations }: EducationTabProps) {
  const addEducation = () => {
    setEducations([
      ...educations,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            Education &amp; Academic Degrees
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            List your universities, degrees, majors, and graduation years.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="size-3.5" />
          Add Education
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <GraduationCap className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No degrees listed</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add your degree, university name, and graduation year for Jake&apos;s ATS Resume.
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Degree
          </button>
        </div>
      ) : (
        educations.map((edu, eduIdx) => (
          <div key={eduIdx} className="bg-card border border-border rounded-xl p-6 shadow-sm relative group">
            <button
              type="button"
              onClick={() => removeEducation(eduIdx)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Remove education"
            >
              <Trash2 className="size-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Institution / University *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(eduIdx, "institution", e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Degree *</label>
                <input
                  type="text"
                  value={edu.degree || ""}
                  onChange={(e) => updateEducation(eduIdx, "degree", e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Field of Study / Major</label>
                <input
                  type="text"
                  value={edu.fieldOfStudy || ""}
                  onChange={(e) => updateEducation(eduIdx, "fieldOfStudy", e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                  <input
                    type="text"
                    value={edu.startDate || ""}
                    onChange={(e) => updateEducation(eduIdx, "startDate", e.target.value)}
                    placeholder="2018"
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date / Grad</label>
                  <input
                    type="text"
                    value={edu.endDate || ""}
                    onChange={(e) => updateEducation(eduIdx, "endDate", e.target.value)}
                    placeholder="2022"
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
