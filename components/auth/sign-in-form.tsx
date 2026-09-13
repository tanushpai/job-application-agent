"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");
  const authError = searchParams.get("error");

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "Invalid authentication credentials." : null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!formData.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false,
          callbackUrl,
        });

        if (res?.error) {
          setErrorMessage("Invalid email or password. Please try again.");
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } catch (err) {
        console.error("Sign-in submission error:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Registration Success Banner */}
      {registered && !errorMessage && (
        <div
          role="status"
          className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">
            Account created successfully! Please sign in with your credentials.
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isPending}
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={isPending}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

export function SignInForm() {
  return (
    <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
