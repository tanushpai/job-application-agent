"use server";

import { requireAuth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enqueueApplicationJob } from "@/lib/queue/boss";
import { processApplicationJob } from "@/lib/queue/worker";
import { revalidatePath } from "next/cache";

/**
 * Triggers an application submission (Manual or Automatic).
 */
export async function createApplication(data: {
  jobId: string;
  mode: "MANUAL" | "AUTOMATIC";
  resumeId?: string;
}) {
  const user = await requireAuth();

  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Check if active application already exists for this job
  const existing = await prisma.application.findFirst({
    where: {
      userId: user.id,
      jobId: data.jobId,
      status: {
        notIn: ["FAILED", "CANCELLED"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing && existing.status === "APPLIED") {
    return {
      success: true,
      alreadyApplied: true,
      applicationId: existing.id,
      message: "You have already applied for this job.",
    };
  }

  // Create Application record in QUEUED or APPLIED (if manual)
  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: data.jobId,
      resumeId: data.resumeId,
      mode: data.mode,
      status: data.mode === "MANUAL" ? "APPLIED" : "QUEUED",
      appliedUrl: job.applyUrl || job.jobUrl,
      submittedAt: data.mode === "MANUAL" ? new Date() : null,
    },
  });

  // Log initial event
  await prisma.applicationEvent.create({
    data: {
      applicationId: application.id,
      eventType: "APPLICATION_CREATED",
      stage: "Initialized",
      message:
        data.mode === "MANUAL"
          ? "User applied manually via external job board link"
          : "Application created and queued for AI agent processing",
    },
  });

  if (data.mode === "AUTOMATIC") {
    // Send to pg-boss queue
    try {
      await enqueueApplicationJob({
        applicationId: application.id,
        userId: user.id,
        jobId: data.jobId,
        resumeId: data.resumeId,
      });
    } catch (queueErr) {
      console.warn("[createApplication] Direct queue dispatch fallback:", queueErr);
      // As a fallback in environments where pg-boss worker isn't running as a daemon, invoke asynchronously
      setTimeout(() => {
        processApplicationJob({
          applicationId: application.id,
          userId: user.id,
          jobId: data.jobId,
          resumeId: data.resumeId,
        }).catch((err) => console.error("[createApplication] Async run error:", err));
      }, 100);
    }
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/application-status");

  return {
    success: true,
    applicationId: application.id,
    mode: data.mode,
    status: application.status,
  };
}

/**
 * Gets all applications for current user with full event history and screenshots.
 */
export async function getUserApplications() {
  const user = await requireAuth();

  return await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      job: true,
      resume: true,
      events: { orderBy: { createdAt: "desc" } },
      fields: true,
      browserSessions: { orderBy: { startedAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retries an existing application (e.g. after user filled missing profile info).
 */
export async function retryApplication(applicationId: string) {
  const user = await requireAuth();

  const application = await prisma.application.findUnique({
    where: { id: applicationId, userId: user.id },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "QUEUED",
      failureReason: null,
      missingFields: undefined,
      retryCount: { increment: 1 },
    },
  });

  await prisma.applicationEvent.create({
    data: {
      applicationId,
      eventType: "APPLICATION_RETRIED",
      stage: "Queued",
      message: "Application restarted by user after profile update",
    },
  });

  try {
    await enqueueApplicationJob({
      applicationId: application.id,
      userId: user.id,
      jobId: application.jobId,
      resumeId: application.resumeId,
    });
  } catch {
    setTimeout(() => {
      processApplicationJob({
        applicationId: application.id,
        userId: user.id,
        jobId: application.jobId,
        resumeId: application.resumeId,
      }).catch((err) => console.error("[retryApplication] Async fallback error:", err));
    }, 100);
  }

  revalidatePath("/dashboard/application-status");
  return { success: true };
}

/**
 * Cancels a queued or active application.
 */
export async function cancelApplication(applicationId: string) {
  const user = await requireAuth();

  await prisma.application.update({
    where: { id: applicationId, userId: user.id },
    data: {
      status: "CANCELLED",
      failureReason: "Cancelled by user",
    },
  });

  await prisma.applicationEvent.create({
    data: {
      applicationId,
      eventType: "APPLICATION_CANCELLED",
      stage: "Cancelled",
      message: "Application was cancelled by candidate",
    },
  });

  revalidatePath("/dashboard/application-status");
  return { success: true };
}
