"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw, 
  Bookmark, 
  Globe, 
  SlidersHorizontal,
  X
} from "lucide-react";
import { refreshAllConnectors } from "@/lib/actions/jobs-actions";
import { useRouter, useSearchParams } from "next/navigation";

interface JobFiltersProps {
  initialSearch?: string;
  initialLocationType?: string;
  initialSavedOnly?: boolean;
}

export function JobFilters({
  initialSearch = "",
  initialLocationType = "all",
  initialSavedOnly = false,
}: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [locationType, setLocationType] = useState(initialLocationType);
  const [savedOnly, setSavedOnly] = useState(initialSavedOnly);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applyFilters = (newSearch?: string, newLoc?: string, newSaved?: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    const s = newSearch !== undefined ? newSearch : search;
    const l = newLoc !== undefined ? newLoc : locationType;
    const sav = newSaved !== undefined ? newSaved : savedOnly;

    if (s) params.set("search", s);
    else params.delete("search");

    if (l && l !== "all") params.set("locationType", l);
    else params.delete("locationType");

    if (sav) params.set("savedOnly", "true");
    else params.delete("savedOnly");

    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleClearSearch = () => {
    setSearch("");
    applyFilters("");
  };

  const handleLocationChange = (loc: string) => {
    setLocationType(loc);
    applyFilters(undefined, loc);
  };

  const handleSavedToggle = () => {
    const nextSaved = !savedOnly;
    setSavedOnly(nextSaved);
    applyFilters(undefined, undefined, nextSaved);
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

  return (
    <div className="flex flex-col gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/60 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company name, or tech stack..."
            className="pl-9 pr-8 h-10 w-full bg-background/80"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Global Action: Refresh */}
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 px-4 gap-2 shrink-0 border-border text-xs font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          {isRefreshing ? "Scanning Connectors..." : "Scan for New Jobs"}
        </Button>
      </div>

      {/* Filter Chips row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <SlidersHorizontal className="h-3 w-3" /> Location:
          </span>

          <Button
            size="sm"
            variant={locationType === "all" ? "default" : "outline"}
            onClick={() => handleLocationChange("all")}
            className="h-7 text-xs px-3 rounded-full"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={locationType === "remote" ? "default" : "outline"}
            onClick={() => handleLocationChange("remote")}
            className="h-7 text-xs px-3 rounded-full gap-1.5"
          >
            <Globe className="h-3 w-3" /> Remote
          </Button>
          <Button
            size="sm"
            variant={locationType === "hybrid" ? "default" : "outline"}
            onClick={() => handleLocationChange("hybrid")}
            className="h-7 text-xs px-3 rounded-full"
          >
            Hybrid
          </Button>
          <Button
            size="sm"
            variant={locationType === "onsite" ? "default" : "outline"}
            onClick={() => handleLocationChange("onsite")}
            className="h-7 text-xs px-3 rounded-full"
          >
            On-site
          </Button>
        </div>

        {/* Saved toggle button */}
        <Button
          size="sm"
          variant={savedOnly ? "secondary" : "ghost"}
          onClick={handleSavedToggle}
          className={`h-7 text-xs px-3 rounded-full gap-1.5 ${
            savedOnly ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${savedOnly ? "fill-primary" : ""}`} />
          {savedOnly ? "Showing Saved Only" : "Saved Jobs"}
        </Button>
      </div>
    </div>
  );
}
