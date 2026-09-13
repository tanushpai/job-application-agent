/**
 * Pure utility functions for profile completeness.
 * This file has NO "use server" directive so it can be imported anywhere.
 */

export interface ProfileCompleteness {
  percentage: number;
  color: string; // "red" | "amber" | "emerald"
  badgeLabel: string;
  sections: Array<{
    name: string;
    completed: boolean;
    weight: number;
  }>;
}

/**
 * Calculates completeness percentage (0-100%) and section breakdown.
 */
export function calculateProfileCompleteness(profile: {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  skills?: unknown[];
  experiences?: unknown[];
  educations?: unknown[];
  projects?: unknown[];
  certifications?: unknown[];
} | null): ProfileCompleteness {
  if (!profile) {
    return {
      percentage: 0,
      color: "red",
      badgeLabel: "Incomplete",
      sections: [
        { name: "Personal Information", completed: false, weight: 20 },
        { name: "Professional Summary", completed: false, weight: 15 },
        { name: "Work Experience", completed: false, weight: 25 },
        { name: "Education", completed: false, weight: 15 },
        { name: "Skills", completed: false, weight: 15 },
        { name: "Projects & Certifications", completed: false, weight: 10 },
      ],
    };
  }

  const hasPersonalInfo = Boolean(profile.fullName && (profile.email || profile.phone));
  const hasSummary = Boolean(profile.summary && profile.summary.trim().length > 10);
  const hasExperience = Boolean(profile.experiences && profile.experiences.length > 0);
  const hasEducation = Boolean(profile.educations && profile.educations.length > 0);
  const hasSkills = Boolean(profile.skills && profile.skills.length > 0);
  const hasProjectsOrCerts = Boolean(
    (profile.projects && profile.projects.length > 0) ||
    (profile.certifications && profile.certifications.length > 0)
  );

  const sections = [
    { name: "Personal Information", completed: hasPersonalInfo, weight: 20 },
    { name: "Professional Summary", completed: hasSummary, weight: 15 },
    { name: "Work Experience", completed: hasExperience, weight: 25 },
    { name: "Education", completed: hasEducation, weight: 15 },
    { name: "Skills", completed: hasSkills, weight: 15 },
    { name: "Projects & Certifications", completed: hasProjectsOrCerts, weight: 10 },
  ];

  const percentage = sections.reduce(
    (acc, sec) => acc + (sec.completed ? sec.weight : 0),
    0
  );

  let color = "red";
  let badgeLabel = "Needs Attention";
  if (percentage >= 80) {
    color = "emerald";
    badgeLabel = "All-Star Profile";
  } else if (percentage >= 40) {
    color = "amber";
    badgeLabel = "Intermediate";
  }

  return { percentage, color, badgeLabel, sections };
}
