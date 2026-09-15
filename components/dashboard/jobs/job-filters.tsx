"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  Bookmark,
  Globe,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  Briefcase,
  GraduationCap,
  ArrowUpDown,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { refreshAllConnectors } from "@/lib/actions/jobs-actions";
import { useRouter, useSearchParams } from "next/navigation";

interface JobFiltersProps {
  initialSearch?: string;
  initialLocation?: string;
  initialLocationType?: string;
  initialJobType?: string;
  initialExperienceLevel?: string;
  initialMinMatchScore?: string;
  initialSortBy?: string;
  initialConnectorSlug?: string;
  initialSavedOnly?: boolean;
  totalJobsCount?: number;
}

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const EXPERIENCE_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
  { value: "executive", label: "Executive" },
];

const MATCH_SCORES = [
  { value: "0", label: "All Scores" },
  { value: "60", label: "60%+ Good Match" },
  { value: "80", label: "80%+ High Match" },
];

const SORT_OPTIONS = [
  { value: "match", label: "AI Match Score" },
  { value: "recent", label: "Most Recent" },
  { value: "company", label: "Company Name" },
];

export function JobFilters({
  initialSearch = "",
  initialLocation = "",
  initialLocationType = "all",
  initialJobType = "all",
  initialExperienceLevel = "all",
  initialMinMatchScore = "0",
  initialSortBy = "match",
  initialSavedOnly = false,
  totalJobsCount,
}: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [locationType, setLocationType] = useState(initialLocationType || "all");
  const [jobType, setJobType] = useState(initialJobType || "all");
  const [experienceLevel, setExperienceLevel] = useState(initialExperienceLevel || "all");
  const [minMatchScore, setMinMatchScore] = useState(initialMinMatchScore || "0");
  const [sortBy, setSortBy] = useState(initialSortBy || "match");
  const [savedOnly, setSavedOnly] = useState(initialSavedOnly);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applyFilters = (overrides: {
    search?: string;
    location?: string;
    locationType?: string;
    jobType?: string;
    experienceLevel?: string;
    minMatchScore?: string;
    sortBy?: string;
    savedOnly?: boolean;
  } = {}) => {
    const params = new URLSearchParams();

    const s = overrides.search !== undefined ? overrides.search : search;
    const loc = overrides.location !== undefined ? overrides.location : location;
    const l = overrides.locationType !== undefined ? overrides.locationType : locationType;
    const jt = overrides.jobType !== undefined ? overrides.jobType : jobType;
    const el = overrides.experienceLevel !== undefined ? overrides.experienceLevel : experienceLevel;
    const mm = overrides.minMatchScore !== undefined ? overrides.minMatchScore : minMatchScore;
    const sb = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
    const sav = overrides.savedOnly !== undefined ? overrides.savedOnly : savedOnly;

    if (s) params.set("search", s);
    if (loc && loc.trim()) params.set("location", loc.trim());
    if (l && l !== "all") params.set("locationType", l);
    if (jt && jt !== "all") params.set("jobType", jt);
    if (el && el !== "all") params.set("experienceLevel", el);
    if (mm && mm !== "0") params.set("minMatchScore", mm);
    if (sb && sb !== "match") params.set("sortBy", sb);
    if (sav) params.set("savedOnly", "true");

    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleLocationChange = (loc: string) => {
    setLocationType(loc);
    applyFilters({ locationType: loc });
  };

  const handleJobTypeChange = (jt: string) => {
    setJobType(jt);
    applyFilters({ jobType: jt });
  };

  const handleExperienceLevelChange = (el: string) => {
    setExperienceLevel(el);
    applyFilters({ experienceLevel: el });
  };

  const handleMatchScoreChange = (score: string) => {
    setMinMatchScore(score);
    applyFilters({ minMatchScore: score });
  };

  const handleSortChange = (sb: string) => {
    setSortBy(sb);
    applyFilters({ sortBy: sb });
  };

  const handleSavedToggle = () => {
    const next = !savedOnly;
    setSavedOnly(next);
    applyFilters({ savedOnly: next });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllConnectors();
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setLocation("");
    setLocationType("all");
    setJobType("all");
    setExperienceLevel("all");
    setMinMatchScore("0");
    setSortBy("match");
    setSavedOnly(false);
    router.push("/dashboard/jobs");
  };

  const activeFilterCount = [
    locationType !== "all",
    jobType !== "all",
    experienceLevel !== "all",
    minMatchScore !== "0",
    sortBy !== "match",
    savedOnly,
    !!search,
    !!location.trim(),
  ].filter(Boolean).length;

  const getJobTypeLabel = () => JOB_TYPES.find((j) => j.value === jobType)?.label || "Job Type";
  const getExpLevelLabel = () => EXPERIENCE_LEVELS.find((e) => e.value === experienceLevel)?.label || "Experience";
  const getMatchScoreLabel = () => MATCH_SCORES.find((m) => m.value === minMatchScore)?.label || "AI Match";
  const getSortLabel = () => SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Sort";

  return (
    <div className="flex flex-col gap-3 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/60 shadow-sm">
      {/* Row 1: Search + Location + Scan button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Job title / keyword search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or tech stack..."
            className="pl-9 pr-8 h-10 w-full bg-background/80"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); applyFilters({ search: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* City / Country location text input */}
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
          className="relative w-full md:w-56 shrink-0"
        >
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or country..."
            className="pl-9 pr-8 h-10 w-full bg-background/80"
          />
          {location && (
            <button
              type="button"
              onClick={() => { setLocation(""); applyFilters({ location: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 px-4 gap-2 shrink-0 border-border text-xs font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          {isRefreshing ? "Scanning..." : "Scan for New Jobs"}
        </Button>
      </div>

      {/* Row 2: All filter chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
        {/* Location label + chips */}
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="h-3 w-3" /> Location:
        </span>
        {[
          { value: "all", label: "All" },
          { value: "remote", label: "Remote" },
          { value: "hybrid", label: "Hybrid" },
          { value: "onsite", label: "On-site" },
        ].map((loc) => (
          <Button
            key={loc.value}
            size="sm"
            variant={locationType === loc.value ? "default" : "outline"}
            onClick={() => handleLocationChange(loc.value)}
            className="h-7 text-xs px-3 rounded-full gap-1"
          >
            {loc.value === "remote" && <Globe className="h-3 w-3" />}
            {loc.label}
          </Button>
        ))}

        <div className="h-5 w-px bg-border/50 mx-0.5 hidden sm:block" />

        {/* Job Type dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant={jobType !== "all" ? "default" : "outline"}
                className={`h-7 text-xs px-3 rounded-full gap-1.5 ${jobType !== "all" ? "" : "text-muted-foreground"}`}
              />
            }
          >
            <Briefcase className="h-3 w-3" />
            {getJobTypeLabel()}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuLabel>Job Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {JOB_TYPES.map((jt) => (
              <DropdownMenuItem
                key={jt.value}
                onClick={() => handleJobTypeChange(jt.value)}
                className={jobType === jt.value ? "font-semibold text-primary bg-primary/5" : ""}
              >
                {jt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Experience Level dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant={experienceLevel !== "all" ? "default" : "outline"}
                className={`h-7 text-xs px-3 rounded-full gap-1.5 ${experienceLevel !== "all" ? "" : "text-muted-foreground"}`}
              />
            }
          >
            <GraduationCap className="h-3 w-3" />
            {getExpLevelLabel()}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuLabel>Experience Level</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {EXPERIENCE_LEVELS.map((el) => (
              <DropdownMenuItem
                key={el.value}
                onClick={() => handleExperienceLevelChange(el.value)}
                className={experienceLevel === el.value ? "font-semibold text-primary bg-primary/5" : ""}
              >
                {el.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Match Score dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant={minMatchScore !== "0" ? "default" : "outline"}
                className={`h-7 text-xs px-3 rounded-full gap-1.5 ${minMatchScore !== "0" ? "" : "text-muted-foreground"}`}
              />
            }
          >
            <Sparkles className="h-3 w-3" />
            {getMatchScoreLabel()}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuLabel>Min. AI Match Score</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MATCH_SCORES.map((m) => (
              <DropdownMenuItem
                key={m.value}
                onClick={() => handleMatchScoreChange(m.value)}
                className={minMatchScore === m.value ? "font-semibold text-primary bg-primary/5" : ""}
              >
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border/50 mx-0.5 hidden sm:block" />

        {/* Sort By dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-3 rounded-full gap-1.5 text-muted-foreground"
              />
            }
          >
            <ArrowUpDown className="h-3 w-3" />
            {getSortLabel()}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => handleSortChange(s.value)}
                className={sortBy === s.value ? "font-semibold text-primary bg-primary/5" : ""}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Push saved jobs to the right */}
        <div className="flex-1" />

        {/* Saved Jobs toggle */}
        <Button
          size="sm"
          variant={savedOnly ? "secondary" : "ghost"}
          onClick={handleSavedToggle}
          className={`h-7 text-xs px-3 rounded-full gap-1.5 ${
            savedOnly ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${savedOnly ? "fill-primary" : ""}`} />
          {savedOnly ? "Saved Only" : "Saved Jobs"}
        </Button>
      </div>

      {/* Row 3: Active filter pills + result count */}
      {(activeFilterCount > 0 || totalJobsCount !== undefined) && (
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFilterCount > 0 && (
              <>
                <span className="text-[11px] text-muted-foreground font-medium">Active:</span>
                {locationType !== "all" && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10" onClick={() => handleLocationChange("all")}>
                    {locationType} <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {jobType !== "all" && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10" onClick={() => handleJobTypeChange("all")}>
                    {JOB_TYPES.find(j => j.value === jobType)?.label} <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {experienceLevel !== "all" && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10" onClick={() => handleExperienceLevelChange("all")}>
                    {EXPERIENCE_LEVELS.find(e => e.value === experienceLevel)?.label} <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {minMatchScore !== "0" && (
                  <Badge className="text-[10px] h-5 px-2 gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20" onClick={() => handleMatchScoreChange("0")}>
                    <Sparkles className="h-2.5 w-2.5" />{minMatchScore}%+ match <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {savedOnly && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10" onClick={handleSavedToggle}>
                    Saved only <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {location.trim() && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10" onClick={() => { setLocation(""); applyFilters({ location: "" }); }}>
                    <MapPin className="h-2.5 w-2.5" />{location} <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 gap-1 rounded-full cursor-pointer hover:bg-destructive/10 max-w-36 truncate" onClick={() => { setSearch(""); applyFilters({ search: "" }); }}>
                    &ldquo;{search}&rdquo; <X className="h-2.5 w-2.5 shrink-0" />
                  </Badge>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 transition-colors"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          {totalJobsCount !== undefined && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              <span className="font-semibold text-foreground">{totalJobsCount}</span>{" "}
              job{totalJobsCount !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
      )}
    </div>
  );
}
