"use server";

import { requireAuth, getCurrentUser } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



/**
 * Fetches the complete profile of the current user.
 */
export async function getUserProfile() {
  try {
    const user = await requireAuth();
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        skills: { orderBy: { createdAt: "asc" } },
        experiences: { orderBy: { createdAt: "desc" } },
        educations: { orderBy: { createdAt: "desc" } },
        projects: { orderBy: { createdAt: "desc" } },
        certifications: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!profile) {
      // Initialize an empty profile for the user if it doesn't exist
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          fullName: user.name || "",
          email: user.email || "",
        },
        include: {
          skills: true,
          experiences: true,
          educations: true,
          projects: true,
          certifications: true,
        },
      });
    }

    return profile;
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
}

/**
 * Checks if a user has completed onboarding (has at least 1 resume or filled profile).
 */
export async function checkUserOnboardingStatus() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { isOnboarded: true, resumeCount: 0 };
    }

    const [resumeCount, profile] = await Promise.all([
      prisma.resume.count({ where: { userId: user.id } }),
      prisma.profile.findUnique({
        where: { userId: user.id },
        include: {
          experiences: { select: { id: true } },
          skills: { select: { id: true } },
        },
      }),
    ]);

    const hasResume = resumeCount > 0;
    const hasFilledProfile = Boolean(
      profile &&
      (profile.summary ||
       profile.experiences.length > 0 ||
       profile.skills.length > 0)
    );

    return {
      isOnboarded: hasResume || hasFilledProfile,
      resumeCount,
    };
  } catch (error) {
    console.error("checkUserOnboardingStatus error:", error);
    return { isOnboarded: true, resumeCount: 0 };
  }
}

/**
 * Updates user profile and related relational sections.
 */
export async function updateUserProfile(data: {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  skills?: Array<{ name: string; category?: string }>;
  experiences?: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    highlights?: string[];
  }>;
  educations?: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  projects?: Array<{
    title: string;
    role?: string;
    description?: string;
    highlights?: string[];
    techStack?: string[];
    link?: string;
    githubUrl?: string;
    challenges?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    url?: string;
  }>;
}) {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: data.fullName || user.name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        location: data.location || "",
        headline: data.headline || "",
        summary: data.summary || "",
        website: data.website || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        twitter: data.twitter || "",
      },
      update: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        headline: data.headline,
        summary: data.summary,
        website: data.website,
        linkedin: data.linkedin,
        github: data.github,
        twitter: data.twitter,
      },
    });

    if (data.fullName && data.fullName !== user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: data.fullName },
      });
    }

    // Update skills if provided
    if (data.skills) {
      await prisma.skill.deleteMany({ where: { profileId: profile.id } });
      if (data.skills.length > 0) {
        await prisma.skill.createMany({
          data: data.skills.map((s) => ({
            profileId: profile.id,
            name: s.name,
            category: s.category || "Technical",
          })),
        });
      }
    }

    // Update experiences if provided
    if (data.experiences) {
      await prisma.experience.deleteMany({ where: { profileId: profile.id } });
      for (const exp of data.experiences) {
        await prisma.experience.create({
          data: {
            profileId: profile.id,
            company: exp.company,
            title: exp.title,
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            isCurrent: exp.isCurrent || false,
            description: exp.description || "",
            highlights: exp.highlights || [],
          },
        });
      }
    }

    // Update educations if provided
    if (data.educations) {
      await prisma.education.deleteMany({ where: { profileId: profile.id } });
      if (data.educations.length > 0) {
        await prisma.education.createMany({
          data: data.educations.map((ed) => ({
            profileId: profile.id,
            institution: ed.institution,
            degree: ed.degree || "",
            fieldOfStudy: ed.fieldOfStudy || "",
            startDate: ed.startDate || "",
            endDate: ed.endDate || "",
            grade: ed.grade || "",
          })),
        });
      }
    }

    // Update projects if provided
    if (data.projects) {
      await prisma.project.deleteMany({ where: { profileId: profile.id } });
      if (data.projects.length > 0) {
        await prisma.project.createMany({
          data: data.projects.map((p) => ({
            profileId: profile.id,
            title: p.title,
            role: p.role || "",
            description: p.description || "",
            highlights: p.highlights || [],
            techStack: p.techStack || [],
            link: p.link || "",
            githubUrl: p.githubUrl || "",
            challenges: p.challenges || "",
          })),
        });
      }
    }

    // Update certifications if provided
    if (data.certifications) {
      await prisma.certification.deleteMany({ where: { profileId: profile.id } });
      if (data.certifications.length > 0) {
        await prisma.certification.createMany({
          data: data.certifications.map((c) => ({
            profileId: profile.id,
            name: c.name,
            issuer: c.issuer || "",
            issueDate: c.issueDate || "",
            url: c.url || "",
          })),
        });
      }
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile.",
    };
  }
}

