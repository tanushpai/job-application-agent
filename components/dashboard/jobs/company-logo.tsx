"use client";

import { useState } from "react";
import { getCompanyLogoUrls } from "@/lib/utils/company-logo";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  company: string;
  logoUrl?: string | null;
  jobUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs rounded-lg",
  md: "h-11 w-11 text-sm rounded-xl",
  lg: "h-14 w-14 text-base rounded-2xl",
};

const imgSizeClasses = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

export function CompanyLogo({
  company,
  logoUrl,
  jobUrl,
  className,
  size = "md",
}: CompanyLogoProps) {
  const logoCandidates = getCompanyLogoUrls(company, logoUrl, jobUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentUrl = logoCandidates[candidateIndex];
  const initials = company
    ? company
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "JB";

  const handleError = () => {
    // If current CDN candidate fails, try next CDN URL candidate
    if (candidateIndex < logoCandidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-white dark:bg-zinc-900 border border-border/80 shadow-sm overflow-hidden p-1.5 transition-all group-hover:border-primary/40",
        sizeClasses[size],
        className
      )}
    >
      {!hasError && currentUrl ? (
        <img
          src={currentUrl}
          alt={`${company} logo`}
          className={cn("object-contain transition-transform duration-200 group-hover:scale-105", imgSizeClasses[size])}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <span className="font-bold text-foreground tracking-tight select-none">
          {initials}
        </span>
      )}
    </div>
  );
}
