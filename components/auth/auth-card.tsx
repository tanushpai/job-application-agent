import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-zinc-900/5 dark:bg-white/5 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md mb-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            JobBuddy AI
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
          {subtitle}
        </p>
      </div>

      {/* Card Body */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/40 dark:shadow-black/40">
        {children}
      </div>

      {/* Footer */}
      {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
    </div>
  );
}
