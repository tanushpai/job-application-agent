import type { Metadata } from "next";
import { getUserResumesWithMetadata } from "@/lib/actions/tailored-resume-actions";
import { getUserProfile } from "@/lib/actions/profile-actions";
import { getSavedJobsForUser } from "@/lib/actions/jobs-actions";
import { ResumeStudio } from "@/components/dashboard/resume/resume-studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Resume Studio | JobBuddy AI",
  description: "AI-tailored resume generator, ATS-compliant Jake's Resume standard, and document manager.",
};

export default async function ResumePage() {
  const [resumes, profile, savedJobs] = await Promise.all([
    getUserResumesWithMetadata(),
    getUserProfile(),
    getSavedJobsForUser(),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <ResumeStudio
        initialResumes={resumes}
        userProfile={profile}
        savedJobs={savedJobs}
      />
    </div>
  );
}

