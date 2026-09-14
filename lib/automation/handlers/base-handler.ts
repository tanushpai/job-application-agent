import { BrowserAutomationProvider, InspectionResult } from "../types";
import { ProfileData, mapProfileToFields } from "../profile-mapper";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export interface HandlerExecutionContext {
  applicationId: string;
  userId: string;
  jobUrl: string;
  provider: BrowserAutomationProvider;
  profile: ProfileData;
  resume?: {
    fileUrl: string;
    fileName: string;
  } | null;
  logEvent: (eventType: string, stage: string, message: string, metadata?: object) => Promise<void>;
  updateStatus: (status: any, failureReason?: string, missingFields?: any) => Promise<void>;
  recordScreenshot: (name: string) => Promise<string | null>;
}

export abstract class BasePlatformHandler {
  abstract readonly platformName: string;

  /**
   * Executes the full platform-specific application lifecycle.
   */
  async execute(ctx: HandlerExecutionContext): Promise<boolean> {
    const { provider, jobUrl, profile, resume, logEvent, updateStatus, recordScreenshot } = ctx;

    // 1. OPENING_BROWSER & Navigate
    await updateStatus("OPENING_BROWSER");
    await logEvent("BROWSER_STARTED", "Browser Navigation", `Opening application page: ${jobUrl}`);
    await provider.navigateTo(jobUrl);
    await recordScreenshot("page_opened");

    // 2. Check for anti-bot blockers / captcha
    const blocker = await provider.detectBlockers();
    if (blocker.isCaptcha || blocker.isAuthWall) {
      await updateStatus("REQUIRES_USER_ACTION", blocker.message);
      await logEvent("BLOCKED", "Security Check", blocker.message || "Manual action required");
      return false;
    }

    // 3. DETECTING_FORM
    await updateStatus("DETECTING_FORM");
    await logEvent("FORM_DETECTED", "Form Inspection", "Inspecting application form inputs and structure");
    const inspection = await provider.inspectForm();

    // Store detected fields in DB
    for (const field of inspection.fields) {
      await prisma.applicationField.create({
        data: {
          applicationId: ctx.applicationId,
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          placeholder: field.placeholder,
          options: field.options ? (field.options as any) : undefined,
          detectedMeaning: field.detectedMeaning,
          selector: field.selector,
          confidence: field.confidence,
          status: "detected",
        },
      });
    }

    // 4. MAPPING_PROFILE & CHECKING REQUIRED FIELDS
    await updateStatus("MAPPING_PROFILE");
    await logEvent("PROFILE_MATCH_STARTED", "Profile Mapping", "Matching profile details against form fields");
    const mapping = await mapProfileToFields(inspection.fields, profile);

    // Save any custom AI generated answers to application record
    if (mapping.customQuestions.length > 0) {
      await prisma.application.update({
        where: { id: ctx.applicationId },
        data: { customQuestions: mapping.customQuestions as any },
      });
    }

    // Resume check: if form has a file input / requires resume, check resume existence
    const hasResumeInput = inspection.fields.some(
      (f) => f.fieldType === "file" || f.detectedMeaning === "resume"
    );

    if (hasResumeInput && !resume) {
      mapping.missingRequiredFields.push({
        field: "resume",
        label: "Resume / CV",
        reason: "This job application requires a resume to be attached.",
      });
    }

    // If required info is missing, halt with MISSING_PROFILE_INFO
    if (mapping.missingRequiredFields.length > 0) {
      await updateStatus(
        "MISSING_PROFILE_INFO",
        `Missing ${mapping.missingRequiredFields.length} required field(s).`,
        mapping.missingRequiredFields
      );
      await logEvent(
        "MISSING_FIELD_DETECTED",
        "Profile Verification",
        `Application paused: Missing required fields: ${mapping.missingRequiredFields.map((f) => f.label).join(", ")}`,
        { missingFields: mapping.missingRequiredFields }
      );
      await recordScreenshot("missing_fields_detected");
      return false;
    }

    await logEvent("PROFILE_VALIDATED", "Profile Verification", "All required fields successfully mapped");
    await updateStatus("READY_TO_APPLY");

    // 5. FILLING_FORM
    await updateStatus("FILLING_FORM");
    await logEvent("FORM_FILL_STARTED", "Form Filling", "Populating form inputs with candidate profile data");

    for (const mapped of mapping.mappedFields) {
      if (!mapped.value) continue;
      try {
        if (mapped.field.fieldType === "select") {
          await provider.selectOption(mapped.field.selector, mapped.value);
        } else if (mapped.field.fieldType === "checkbox") {
          await provider.checkInput(mapped.field.selector, mapped.value === "true" || mapped.value === "1");
        } else {
          await provider.fillField(mapped.field.selector, mapped.value);
        }
      } catch (fillErr) {
        console.warn(`[Handler] Failed to fill field ${mapped.field.label}:`, fillErr);
      }
    }

    // 6. UPLOADING_RESUME
    if (hasResumeInput && resume) {
      await updateStatus("UPLOADING_RESUME");
      await logEvent("RESUME_UPLOADED", "Resume Upload", `Attaching resume: ${resume.fileName}`);
      
      const resumeInput = inspection.fields.find(
        (f) => f.fieldType === "file" || f.detectedMeaning === "resume"
      );

      if (resumeInput) {
        // Resolve absolute local path from storage url
        let absoluteResumePath = "";
        if (resume.fileUrl.startsWith("/uploads/")) {
          absoluteResumePath = path.join(process.cwd(), "public", resume.fileUrl);
        } else {
          // If remote URL, download temporarily into scratch/
          const tempPath = path.join(process.cwd(), "public", "uploads", "resumes", `temp_${Date.now()}_${resume.fileName}`);
          const res = await fetch(resume.fileUrl);
          const buf = await res.arrayBuffer();
          await fs.writeFile(tempPath, Buffer.from(buf));
          absoluteResumePath = tempPath;
        }

        try {
          await provider.uploadFile(resumeInput.selector, absoluteResumePath);
        } catch (uploadErr) {
          console.warn("[Handler] File upload exception:", uploadErr);
        }
      }
    }

    await recordScreenshot("form_filled");

    // 7. VALIDATING
    await updateStatus("VALIDATING");
    await logEvent("FORM_VALIDATED", "Form Validation", "Form validated and ready for submission");

    // 8. SUBMITTING
    await updateStatus("SUBMITTING");
    await logEvent("SUBMISSION_STARTED", "Submission", "Submitting application form");
    if (inspection.submitButtonSelector) {
      try {
        await provider.clickElement(inspection.submitButtonSelector);
      } catch (submitErr) {
        console.warn("[Handler] Submit button click error:", submitErr);
      }
    }

    // 9. VERIFYING_SUBMISSION
    await updateStatus("VERIFYING_SUBMISSION");
    const result = await provider.verifySubmission();
    await recordScreenshot("post_submission");

    if (result.isSubmitted) {
      await updateStatus("APPLIED");
      await logEvent("APPLICATION_COMPLETED", "Completed", result.confirmationMessage || "Application successfully submitted!");
      await prisma.application.update({
        where: { id: ctx.applicationId },
        data: { submittedAt: new Date() },
      });
      return true;
    } else {
      await updateStatus("FAILED", "Could not verify application confirmation after submission.");
      await logEvent("APPLICATION_FAILED", "Failed", "Application submitted but confirmation page was not detected.");
      return false;
    }
  }
}
