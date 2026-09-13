"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function LogoutButton({
  className = "",
  variant = "default",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/sign-in",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoggingOut(false);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium text-sm rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  const variantStyles = {
    default:
      "px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm",
    outline:
      "px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
    ghost:
      "px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10",
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="Sign out"
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}
