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
} from "@/lib/ai/gemini-tailor";
import { TailoredResumePayload, TailoringPreset, ResumeMetadata } from "@/types/resume";
import { UserProfileData } from "@/types/profile";
import { ActionResponse } from "@/types/common";
import { generateJakesResumeHtml } from "@/lib/utils/jakes-resume-template";
import { successResponse, errorResponse } from "@/lib/utils/action-utils";

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
  preset?: TailoringPreset;
  selectedProjectIds?: string[];
}): Promise<ActionResponse<TailoredResumePayload>> {
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
      return errorResponse(
        "Please complete your profile or upload a base resume before generating tailored versions."
      );
    }

    const profileContext: UserProfileData = {
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

    return successResponse(tailoredPayload);
  } catch (err) {
    return errorResponse(err, "GENERATE_TAILORED_RESUME_FAILED");
  }
}

/**
 * Enhances a single project's notes and returns metric-driven bullets and clean architecture notes.
 */
export async function enhanceProjectNotesAction({
  title,
  role,
  techStack,
  description,
  rawDescription,
  highlights,
  challenges,
}: {
  title: string;
  role?: string;
  techStack?: string[];
  description?: string;
  rawDescription?: string;
  highlights?: string[];
  challenges?: string;
}): Promise<ActionResponse<{
  enhancedRole: string;
  enhancedDescription: string;
  highlights: string[];
  suggestedTechStack: string[];
}>> {
  try {
    await requireAuth();
    const effectiveDescription =
      rawDescription ||
      description ||
      highlights?.join("\n") ||
      title;

    const enhanced = await enhanceProjectWithGemini({
      title,
      role,
      techStack,
      rawDescription: effectiveDescription,
      challenges,
    });

    return successResponse(enhanced);
  } catch (err) {
    return errorResponse(err, "ENHANCE_PROJECT_FAILED");
  }
}

/**
 * Saves an AI-tailored resume to storage and Prisma database,
 * compiling a vector PDF with Playwright and Jake's Resume Overleaf styling.
 */
export async function saveTailoredResumeAction(
  payload: TailoredResumePayload,
  setAsDefault = true
): Promise<ActionResponse<ResumeMetadata>> {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const user = await requireAuth();

    // 1. Generate Jake's Resume HTML
    const htmlContent = generateJakesResumeHtml(payload);

    // 2. Render vector PDF using Playwright headless with try...finally guard
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
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

    // 4. If setting default, unset existing default
    if (setAsDefault) {
      await prisma.resume.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 5. Save Resume record in Prisma
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
        isDefault: setAsDefault,
      },
    });

    revalidatePath("/dashboard/resume");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");

    return successResponse(resume as unknown as ResumeMetadata, "Tailored resume saved and compiled successfully!");
  } catch (err) {
    return errorResponse(err, "SAVE_TAILORED_RESUME_FAILED");
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // safe close
      }
    }
  }
}

/**
 * Sets a resume as the user's primary default resume.
 */
export async function setDefaultResumeAction(resumeId: string): Promise<ActionResponse<void>> {
  try {
    const user = await requireAuth();

    await prisma.resume.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    await prisma.resume.update({
      where: { id: resumeId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard/resume");
    revalidatePath("/dashboard/jobs");
    return successResponse(undefined, "Default resume updated.");
  } catch (err) {
    return errorResponse(err, "SET_DEFAULT_RESUME_FAILED");
  }
}

/**
 * Fetches all resumes for the user including tailored metadata.
 */
export async function getUserResumesWithMetadata(): Promise<ResumeMetadata[]> {
  try {
    const user = await requireAuth();
    const list = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return list as unknown as ResumeMetadata[];
  } catch (err) {
    console.error("getUserResumesWithMetadata error:", err);
    return [];
  }
}
