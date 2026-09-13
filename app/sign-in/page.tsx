import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | AI Job Application Agent",
  description:
    "Sign in to your account to access your AI job application agent dashboard.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 via-zinc-100/50 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to your account"
        footer={
          <p className="text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        }
      >
        <SignInForm />
      </AuthCard>
    </div>
  );
}
