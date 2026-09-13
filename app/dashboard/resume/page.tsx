import type { Metadata } from "next";
import { getUserResumes } from "@/lib/actions/resume-actions";
import { ResumeList } from "@/components/dashboard/resume-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resumes | JobBuddy AI",
  description: "AI-tailored resume manager, document uploads, and parsed skills.",
};

export default async function ResumePage() {
  const resumes = await getUserResumes();

  return (
    <div className="max-w-6xl mx-auto">
      <ResumeList initialResumes={resumes} />
    </div>
  );
}
