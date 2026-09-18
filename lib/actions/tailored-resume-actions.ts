"use server";

import { requireAuth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";
import { chromium } from "playwright";
import {
  tailorResumeWithGemini,
  enhanceProjectWithGemini,
  TailoredResumePayload,
  UserProfileContext,
} from "@/lib/ai/gemini-tailor";
import { generateJakesResumeHtml } from "@/lib/utils/jakes-resume-template";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "resumes");

/**
 * Generates an ATS-tailored resume payload using Google Gemini AI and the user's master profile & project hub.
 */
export async function generateAITailoredResumeAction({
  jobDescription,
  targetRole,
  targetCompany,
  preset = "ats_optimized",
  selectedProjectIds,
}: {
  jobDescription: string;
  targetRole?: string;
  targetCompany?: string;
  preset?: "ats_optimized" | "metric_heavy" | "technical_depth" | "executive";
  selectedProjectIds?: string[];
}): Promise<{
  success: boolean;
  payload?: TailoredResumePayload;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    // Fetch user profile with full relational data
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        skills: { orderBy: { createdAt: "asc" } },
        experiences: { orderBy: { startDate: "desc" } },
        educations: { orderBy: { startDate: "desc" } },
        projects: { orderBy: { updatedAt: "desc" } },
        certifications: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!profile) {
      return {
        success: false,
        error: "Please complete your profile or upload a base resume before generating tailored versions.",
      };
    }

    const profileContext: UserProfileContext = {
      fullName: profile.fullName || user.name || "Candidate",
      email: profile.email || user.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      headline: profile.headline || "",
      summary: profile.summary || "",
      website: profile.website || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      twitter: profile.twitter || "",
      skills: profile.skills.map((s) => ({ name: s.name, category: s.category })),
      experiences: profile.experiences.map((e) => ({
        company: e.company,
        title: e.title,
        location: e.location || undefined,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        isCurrent: e.isCurrent,
        description: e.description || undefined,
        highlights: e.highlights,
      })),
      educations: profile.educations.map((ed) => ({
        institution: ed.institution,
        degree: ed.degree || undefined,
        fieldOfStudy: ed.fieldOfStudy || undefined,
        startDate: ed.startDate || undefined,
        endDate: ed.endDate || undefined,
        grade: ed.grade || undefined,
      })),
      projects: profile.projects.map((p) => ({
        id: p.id,
        title: p.title,
        role: p.role || undefined,
        description: p.description || undefined,
        highlights: p.highlights,
        techStack: p.techStack,
        link: p.link || undefined,
        githubUrl: p.githubUrl || undefined,
        challenges: p.challenges || undefined,
      })),
      certifications: profile.certifications.map((c) => ({
        name: c.name,
        issuer: c.issuer || undefined,
        issueDate: c.issueDate || undefined,
        url: c.url || undefined,
      })),
    };

    const tailoredPayload = await tailorResumeWithGemini({
      profile: profileContext,
      jobDescription,
      targetRole,
      targetCompany,
      preset,
      selectedProjectIds,
    });

    return {
      success: true,
      payload: tailoredPayload,
    };
  } catch (err) {
    console.error("generateAITailoredResumeAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate tailored resume.",
    };
  }
}

/**
 * Enhances a single project's notes and returns metric-driven bullets and clean architecture notes.
 */
export async function enhanceProjectNotesAction({
  title,
  role,
  techStack,
  rawDescription,
  challenges,
}: {
  title: string;
  role?: string;
  techStack?: string[];
  rawDescription: string;
  challenges?: string;
}) {
  try {
    await requireAuth();
    const enhanced = await enhanceProjectWithGemini({
      title,
      role,
      techStack,
      rawDescription,
      challenges,
    });

    return { success: true, data: enhanced };
  } catch (err) {
    console.error("enhanceProjectNotesAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to enhance project.",
    };
  }
}


/**
 * Saves an AI-tailored resume to storage and Prisma database,
 * compiling a vector PDF with Playwright and Jake's Resume Overleaf styling.
 */
export async function saveTailoredResumeAction(payload: TailoredResumePayload) {
  try {
    const user = await requireAuth();

    // 1. Generate Jake's Resume HTML
    const htmlContent = generateJakesResumeHtml(payload);

    // 2. Render vector PDF using Playwright headless
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        bottom: "0.4in",
        left: "0.45in",
        right: "0.45in",
      },
    });
    await browser.close();

    // 3. Write PDF buffer to storage
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const timestamp = Date.now();
    const sanitizedTitle = (payload.title || "Tailored_Resume")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const fileName = `${sanitizedTitle}.pdf`;
    const uniqueFileName = `${user.id}_tailored_${timestamp}.pdf`;
    const localFilePath = path.join(UPLOADS_DIR, uniqueFileName);

    await fs.writeFile(localFilePath, pdfBuffer);
    const fileUrl = `/uploads/resumes/${uniqueFileName}`;

    // 4. Save Resume record in Prisma
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: fileName,
        fileUrl: fileUrl,
        fileSize: pdfBuffer.length,
        fileType: "application/pdf",
        parsedData: payload as object,
        title: payload.title || "Tailored Resume",
        isTailored: true,
        targetRole: payload.targetRole || null,
        targetCompany: payload.targetCompany || null,
        tailoringPreset: payload.preset || "ats_optimized",
        atsScore: payload.atsScore || null,
        matchedSkills: payload.matchedSkills || [],
        missingSkills: payload.missingSkills || [],
      },
    });

    revalidatePath("/dashboard/resume");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");

    return {
      success: true,
      resumeId: resume.id,
      fileUrl: resume.fileUrl,
      fileName: resume.fileName,
      message: "Tailored resume saved and compiled to Jake's ATS format PDF successfully!",
    };
  } catch (err) {
    console.error("saveTailoredResumeAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to compile and save tailored resume.",
    };
  }
}

/**
 * Sets a resume as the user's primary default resume.
 */
export async function setDefaultResumeAction(resumeId: string) {
  try {
    const user = await requireAuth();

    // Unset current default
    await prisma.resume.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.resume.update({
      where: { id: resumeId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard/resume");
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (err) {
    console.error("setDefaultResumeAction error:", err);
    return { success: false, error: "Failed to set default resume." };
  }
}

/**
 * Fetches all resumes for the user including tailored metadata.
 */
export async function getUserResumesWithMetadata() {
  try {
    const user = await requireAuth();
    return await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("getUserResumesWithMetadata error:", err);
    return [];
  }
}
