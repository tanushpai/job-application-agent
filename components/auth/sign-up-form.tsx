"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/auth/actions";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password criteria check
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
    matches:
      formData.password.length > 0 &&
      formData.password === formData.confirmPassword,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error upon edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick validation
    if (!formData.name.trim()) {
      setFieldErrors({ name: ["Full name is required"] });
      return;
    }
    if (!formData.email.trim()) {
      setFieldErrors({ email: ["Email address is required"] });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: ["Passwords do not match"] });
      return;
    }

    startTransition(async () => {
      const res = await registerUser(formData);

      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setErrorMessage(res.error || "Failed to create account.");
        return;
      }

      setSuccessMessage("Account created successfully! Signing you in...");

      // Automatically sign in the user
      const signInRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Fallback to sign-in page if automatic sign-in didn't redirect
        router.push("/sign-in?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

      {/* Success Alert */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in duration-200"
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Full Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <User className="w-4 h-4" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            disabled={isPending}
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white transition-all disabled:opacity-60"
          />
        </div>
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

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
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
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
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            disabled={isPending}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* Password Requirements Checklist */}
      {formData.password.length > 0 && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-1.5 animate-in fade-in duration-150">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            Password requirements:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-zinc-500 dark:text-zinc-400">
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.length ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>8+ characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.uppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uppercase letter</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.lowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lowercase letter</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.number ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>One number</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.special ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Special symbol</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                passwordChecks.matches ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
