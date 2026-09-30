import React, { useState } from "react";
import { Wrench, Plus, X } from "lucide-react";
import { SkillItem } from "@/types/profile";

interface SkillsTabProps {
  skills: SkillItem[];
  setSkills: React.Dispatch<React.SetStateAction<SkillItem[]>>;
}

const SKILL_CATEGORIES = [
  "Languages",
  "Frameworks & Libraries",
  "Developer Tools",
  "Cloud & Databases",
  "Technical",
];

export function SkillsTab({ skills, setSkills }: SkillsTabProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Languages");

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setNewSkillName("");
      return;
    }

    setSkills([...skills, { name: newSkillName.trim(), category: newSkillCategory }]);
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
          <Wrench className="size-4 text-primary" />
          Technical &amp; Domain Skills
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Add the programming languages, frameworks, developer tools, and cloud technologies you use.
        </p>

        <form onSubmit={addSkill} className="flex flex-wrap gap-2 mb-6">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="e.g. TypeScript, React, PostgreSQL, Docker"
            className="flex-1 min-w-[200px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          >
            {SKILL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Add Skill
          </button>
        </form>

        <div className="space-y-4">
          {SKILL_CATEGORIES.map((category) => {
            const categorySkills = skills.filter(
              (s) => (s.category || "Technical") === category
            );

            if (categorySkills.length === 0) return null;

            return (
              <div key={category} className="border-t border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category} ({categorySkills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const originalIndex = skills.findIndex((s) => s === skill);
                    return (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground border border-border"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => removeSkill(originalIndex)}
                          className="hover:text-destructive focus:outline-none"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
