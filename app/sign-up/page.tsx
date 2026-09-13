import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account | AI Job Application Agent",
  description:
    "Create your account to start automating your job applications with AI.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 via-zinc-100/50 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      <AuthCard
        title="Create your account"
        subtitle="Get started in seconds. No credit card required."
        footer={
          <p className="text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        }
      >
        <SignUpForm />
      </AuthCard>
    </div>
  );
}
