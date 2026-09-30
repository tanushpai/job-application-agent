import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, Sparkles, Loader2, GitBranch, Link2 } from "lucide-react";
import { ProjectItem } from "@/types/profile";
import { enhanceProjectNotesAction } from "@/lib/actions/tailored-resume-actions";

interface ProjectsTabProps {
  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
}

export function ProjectsTab({ projects, setProjects }: ProjectsTabProps) {
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);

  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        role: "",
        description: "",
        highlights: [""],
        techStack: [],
        link: "",
        githubUrl: "",
        challenges: "",
      },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: unknown) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addHighlight = (projIndex: number) => {
    const updated = [...projects];
    const current = updated[projIndex].highlights || [];
    updated[projIndex].highlights = [...current, ""];
    setProjects(updated);
  };

  const updateHighlight = (projIndex: number, hlIndex: number, text: string) => {
    const updated = [...projects];
    const current = [...(updated[projIndex].highlights || [])];
    current[hlIndex] = text;
    updated[projIndex].highlights = current;
    setProjects(updated);
  };

  const removeHighlight = (projIndex: number, hlIndex: number) => {
    const updated = [...projects];
    const current = (updated[projIndex].highlights || []).filter((_, i) => i !== hlIndex);
    updated[projIndex].highlights = current;
    setProjects(updated);
  };

  const handleAiPolish = async (projIdx: number) => {
    const proj = projects[projIdx];
    if (!proj.title && !proj.description) {
      alert("Please enter a project title or description before asking AI to polish it.");
      return;
    }

    setEnhancingIndex(projIdx);
    try {
      const result = await enhanceProjectNotesAction({
        title: proj.title || "Software Project",
        role: proj.role || undefined,
        description: proj.description || undefined,
        highlights: proj.highlights?.filter((h) => h.trim().length > 0),
        techStack: proj.techStack || [],
        challenges: proj.challenges || undefined,
      });

      if (result.success && result.data) {
        const updated = [...projects];
        updated[projIdx] = {
          ...updated[projIdx],
          highlights: result.data.highlights,
          techStack: result.data.suggestedTechStack,
          challenges: updated[projIdx].challenges,
        };
        setProjects(updated);
      } else if (!result.success) {
        alert(result.error || "Could not polish project notes.");
      }
    } catch {
      alert("AI enhancement failed. Please try again.");
    } finally {
      setEnhancingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FolderGit2 className="size-4 text-primary" />
            Project Context Hub (Knowledge Base)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store deep technical details about your projects. Gemini AI uses this context to tailor resumes with high accuracy.
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="size-3.5" />
          Add Project Context
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <FolderGit2 className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No project context added yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Adding in-depth project context enables AI to tailor custom bullet points and match ATS keywords for targeted roles.
          </p>
          <button
            type="button"
            onClick={addProject}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add First Project
          </button>
        </div>
      ) : (
        projects.map((proj, projIdx) => (
          <div key={projIdx} className="bg-card border border-border rounded-xl p-6 shadow-sm relative group">
            <div className="flex items-center justify-between mb-4 pr-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Project #{projIdx + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAiPolish(projIdx)}
                  disabled={enhancingIndex === projIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                  title="Enhance notes into quantified Google XYZ formula bullet points"
                >
                  {enhancingIndex === projIdx ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5 text-indigo-400" />
                  )}
                  <span>✨ AI Polish Bullets</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeProject(projIdx)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => updateProject(projIdx, "title", e.target.value)}
                  placeholder="e.g. Distributed Task Queue &amp; Worker Engine"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Role</label>
                <input
                  type="text"
                  value={proj.role || ""}
                  onChange={(e) => updateProject(projIdx, "role", e.target.value)}
                  placeholder="e.g. Lead Architect / Full Stack Engineer"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <GitBranch className="size-3" /> GitHub Repo URL
                </label>
                <input
                  type="url"
                  value={proj.githubUrl || ""}
                  onChange={(e) => updateProject(projIdx, "githubUrl", e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Link2 className="size-3" /> Live Demo URL
                </label>
                <input
                  type="url"
                  value={proj.link || ""}
                  onChange={(e) => updateProject(projIdx, "link", e.target.value)}
                  placeholder="https://myproject.demo.com"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                value={proj.techStack?.join(", ") || ""}
                onChange={(e) =>
                  updateProject(
                    projIdx,
                    "techStack",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="TypeScript, Next.js, Redis, PostgreSQL, Docker, AWS ECS"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Raw Project Notes &amp; Architecture Overview
              </label>
              <textarea
                rows={2}
                value={proj.description || ""}
                onChange={(e) => updateProject(projIdx, "description", e.target.value)}
                placeholder="Describe what the system did, scale, traffic, or key architectural challenges."
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Achievements &amp; Metrics (Overleaf Jake&apos;s Format)
                </label>
                <button
                  type="button"
                  onClick={() => addHighlight(projIdx)}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Bullet
                </button>
              </div>

              {(proj.highlights || []).map((hl, hlIdx) => (
                <div key={hlIdx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground select-none">•</span>
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => updateHighlight(projIdx, hlIdx, e.target.value)}
                    placeholder="Built [X] achieving [Y]% speedup using [Z]..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(projIdx, hlIdx)}
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
