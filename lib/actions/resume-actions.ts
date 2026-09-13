"use server";

import { requireAuth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadResumeFile, deleteResumeFile } from "@/lib/storage";
import {
  extractTextFromFileBuffer,
  parseResumeWithGemini,
  ParsedResumeData,
} from "@/lib/ai/gemini-parser";
import { revalidatePath } from "next/cache";

export type UploadResumeResponse = {
  success: boolean;
  message?: string;
  error?: string;
  resumeId?: string;
  parsedData?: ParsedResumeData;
};

/**
 * Uploads a resume, saves file, parses with Gemini AI, and populates database.
 */
export async function uploadAndParseResume(
  formData: FormData
): Promise<UploadResumeResponse> {
  try {
    const user = await requireAuth();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Please select a valid resume file (PDF or DOCX).",
      };
    }

    // 1. Upload to storage (local filesystem or Supabase)
    const storageResult = await uploadResumeFile(file, user.id);

    // 2. Extract text from file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extractedText = await extractTextFromFileBuffer(
      buffer,
      file.type,
      file.name
    );

    // 3. Parse with Google Gemini AI
    const parsedData = await parseResumeWithGemini(extractedText, file.name);

    // 4. Save Resume record in Prisma
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: storageResult.fileName,
        fileUrl: storageResult.fileUrl,
        fileSize: storageResult.fileSize,
        fileType: storageResult.fileType,
        parsedData: parsedData as object,
      },
    });

    // 5. Upsert Profile and all related entities in Prisma
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: parsedData.fullName || user.name || "",
        email: parsedData.email || user.email || "",
        phone: parsedData.phone || "",
        location: parsedData.location || "",
        headline: parsedData.headline || "",
        summary: parsedData.summary || "",
        website: parsedData.website || "",
        linkedin: parsedData.linkedin || "",
        github: parsedData.github || "",
        twitter: parsedData.twitter || "",
      },
      update: {
        fullName: parsedData.fullName || undefined,
        email: parsedData.email || undefined,
        phone: parsedData.phone || undefined,
        location: parsedData.location || undefined,
        headline: parsedData.headline || undefined,
        summary: parsedData.summary || undefined,
        website: parsedData.website || undefined,
        linkedin: parsedData.linkedin || undefined,
        github: parsedData.github || undefined,
        twitter: parsedData.twitter || undefined,
      },
    });

    // Update User name if empty
    if (parsedData.fullName && (!user.name || user.name === "User")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: parsedData.fullName },
      });
    }

    // Clear old nested entries to refresh with new structured data
    await prisma.$transaction([
      prisma.skill.deleteMany({ where: { profileId: profile.id } }),
      prisma.experience.deleteMany({ where: { profileId: profile.id } }),
      prisma.education.deleteMany({ where: { profileId: profile.id } }),
      prisma.project.deleteMany({ where: { profileId: profile.id } }),
      prisma.certification.deleteMany({ where: { profileId: profile.id } }),
    ]);

    // Insert new parsed records
    if (parsedData.skills.length > 0) {
      await prisma.skill.createMany({
        data: parsedData.skills.map((s) => ({
          profileId: profile.id,
          name: s.name,
          category: s.category || "Technical",
        })),
      });
    }

    if (parsedData.experiences.length > 0) {
      for (const exp of parsedData.experiences) {
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

    if (parsedData.educations.length > 0) {
      await prisma.education.createMany({
        data: parsedData.educations.map((ed) => ({
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

    if (parsedData.projects.length > 0) {
      await prisma.project.createMany({
        data: parsedData.projects.map((p) => ({
          profileId: profile.id,
          title: p.title,
          description: p.description || "",
          techStack: p.techStack || [],
          link: p.link || "",
        })),
      });
    }

    if (parsedData.certifications.length > 0) {
      await prisma.certification.createMany({
        data: parsedData.certifications.map((c) => ({
          profileId: profile.id,
          name: c.name,
          issuer: c.issuer || "",
          issueDate: c.issueDate || "",
          url: c.url || "",
        })),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/resume");

    return {
      success: true,
      message: "Resume uploaded, parsed by Gemini AI, and profile populated successfully!",
      resumeId: resume.id,
      parsedData,
    };
  } catch (error) {
    console.error("Upload and parse resume error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while parsing your resume.",
    };
  }
}

/**
 * Fetches all resumes for the authenticated user.
 */
export async function getUserResumes() {
  try {
    const user = await requireAuth();
    return await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getUserResumes error:", error);
    return [];
  }
}

/**
 * Deletes a resume from database and storage.
 */
export async function deleteResume(resumeId: string) {
  try {
    const user = await requireAuth();
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return { success: false, error: "Resume not found." };
    }

    await deleteResumeFile(resume.fileUrl, user.id);
    await prisma.resume.delete({ where: { id: resumeId } });

    revalidatePath("/dashboard/resume");
    revalidatePath("/dashboard");
    return { success: true, message: "Resume deleted successfully." };
  } catch (error) {
    console.error("deleteResume error:", error);
    return { success: false, error: "Failed to delete resume." };
  }
}
