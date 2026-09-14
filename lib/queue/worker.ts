import { startBoss, APPLICATION_QUEUE_NAME, ApplicationJobPayload } from "./boss";
import { prisma } from "@/lib/prisma";
import { LocalPlaywrightProvider } from "@/lib/automation/local-playwright-provider";
import { detectPlatformFromUrl } from "@/lib/automation/platform-detector";
import { GreenhouseApplicationHandler } from "@/lib/automation/handlers/greenhouse-handler";
import { LeverApplicationHandler } from "@/lib/automation/handlers/lever-handler";
import { WorkableApplicationHandler } from "@/lib/automation/handlers/workable-handler";
import { BasePlatformHandler } from "@/lib/automation/handlers/base-handler";

/**
 * Platform handler factory matching detected platform slug.
 */
function getPlatformHandler(platform: string): BasePlatformHandler {
  switch (platform) {
    case "greenhouse":
      return new GreenhouseApplicationHandler();
    case "lever":
      return new LeverApplicationHandler();
    case "workable":
      return new WorkableApplicationHandler();
    default:
      // Fallback to base generic platform handler
      return new GreenhouseApplicationHandler();
  }
}

/**
 * Processes a single application job with strict sequential execution per user.
 */
export async function processApplicationJob(payload: ApplicationJobPayload): Promise<void> {
  const { applicationId, userId, jobId, resumeId } = payload;
  console.log(`[Worker] Starting application job ${applicationId} for user ${userId}`);

  // Fetch full user profile & resume & job details
  const [application, job, profile, resume] = await Promise.all([
    prisma.application.findUnique({ where: { id: applicationId } }),
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: true,
        experiences: { orderBy: { startDate: "desc" } },
        educations: { orderBy: { startDate: "desc" } },
        projects: true,
        certifications: true,
      },
    }),
    resumeId
      ? prisma.resume.findUnique({ where: { id: resumeId } })
      : prisma.resume.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!application || !job) {
    console.error(`[Worker] Application ${applicationId} or Job ${jobId} not found.`);
    return;
  }

  // Create BrowserSession record in database
  const browserSession = await prisma.browserSession.create({
    data: {
      applicationId,
      userId,
      browserType: "chromium",
      status: "active",
      screenshotPaths: [],
    },
  });

  const screenshots: string[] = [];
  const provider = new LocalPlaywrightProvider();

  // Helper callbacks
  const logEvent = async (eventType: string, stage: string, message: string, metadata?: object) => {
    try {
      await prisma.applicationEvent.create({
        data: {
          applicationId,
          eventType,
          stage,
          message,
          metadata: metadata ? (metadata as any) : undefined,
        },
      });
    } catch (err) {
      console.warn("[Worker] Event log warning:", err);
    }
  };

  const updateStatus = async (status: any, failureReason?: string, missingFields?: any) => {
    try {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status,
          failureReason: failureReason || null,
          missingFields: missingFields ? (missingFields as any) : undefined,
        },
      });
    } catch (err) {
      console.warn("[Worker] Status update warning:", err);
    }
  };

  const recordScreenshot = async (name: string): Promise<string | null> => {
    try {
      const url = await provider.takeScreenshot(name);
      if (url) {
        screenshots.push(url);
        await prisma.browserSession.update({
          where: { id: browserSession.id },
          data: { screenshotPaths: screenshots },
        });
      }
      return url;
    } catch {
      return null;
    }
  };

  try {
    // 1. Initial event
    await logEvent("APPLICATION_CREATED", "Queue Started", "Application worker picked up job");

    // 2. DETECTING_PLATFORM
    await updateStatus("DETECTING_PLATFORM");
    const targetUrl = job.applyUrl || job.jobUrl;
    const { platform } = detectPlatformFromUrl(targetUrl);
    
    await prisma.application.update({
      where: { id: applicationId },
      data: { platform, appliedUrl: targetUrl },
    });
    await logEvent("PLATFORM_DETECTED", "Platform Detection", `Detected target ATS platform: ${platform}`);

    // 3. Initialize Browser
    await provider.initSession(browserSession.id, { headless: true });

    // 4. Dispatch to Platform Handler
    const handler = getPlatformHandler(platform);
    await handler.execute({
      applicationId,
      userId,
      jobUrl: targetUrl,
      provider,
      profile: {
        fullName: profile?.fullName,
        email: profile?.email,
        phone: profile?.phone,
        location: profile?.location,
        headline: profile?.headline,
        summary: profile?.summary,
        website: profile?.website,
        linkedin: profile?.linkedin,
        github: profile?.github,
        skills: profile?.skills || [],
        experiences: profile?.experiences || [],
        educations: profile?.educations || [],
      },
      resume: resume
        ? {
            fileUrl: resume.fileUrl,
            fileName: resume.fileName,
          }
        : null,
      logEvent,
      updateStatus,
      recordScreenshot,
    });

    // Mark browser session completed
    await prisma.browserSession.update({
      where: { id: browserSession.id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.error(`[Worker] Error processing application ${applicationId}:`, err);
    await updateStatus("FAILED", err?.message || "Unexpected browser worker error");
    await logEvent("APPLICATION_FAILED", "Error", err?.message || "Worker execution failed");
    await prisma.browserSession.update({
      where: { id: browserSession.id },
      data: {
        status: "failed",
        error: err?.message || "Execution exception",
        completedAt: new Date(),
      },
    });
  } finally {
    await provider.closeSession();
  }
}

/**
 * Initializes the pg-boss worker subscription for the application queue.
 */
export async function startApplicationWorker(): Promise<void> {
  const boss = await startBoss();

  console.log(`[Worker] Subscribing to queue: ${APPLICATION_QUEUE_NAME}`);
  await boss.work(APPLICATION_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const job = jobs[0];
    if (job && job.data) {
      await processApplicationJob(job.data as ApplicationJobPayload);
    }
  });
}
