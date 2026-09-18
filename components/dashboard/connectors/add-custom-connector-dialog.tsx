"use client";

import { useState } from "react";
import { Plus, Sparkles, Building2, Loader2, Link2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyLogo } from "@/components/dashboard/jobs/company-logo";
import { addCustomCompanyConnector } from "@/lib/actions/custom-connector-actions";
import { useRouter } from "next/navigation";

export function AddCustomConnectorDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [careersUrl, setCareersUrl] = useState("");
  const [targetRolesInput, setTargetRolesInput] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Please enter a company name.");
      return;
    }

    setLoading(true);
    setError(null);

    const targetRoles = targetRolesInput
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const res = await addCustomCompanyConnector({
        companyName: companyName.trim(),
        careersUrl: careersUrl.trim() || `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/careers`,
        targetRoles,
      });

      if (res.success) {
        setOpen(false);
        setCompanyName("");
        setCareersUrl("");
        setTargetRolesInput("");
        router.refresh();
      } else {
        setError(res.error || "Failed to add company connector.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Add Custom Company
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
                <Sparkles className="h-3.5 w-3.5" /> Custom Job Source
              </div>
              <DialogTitle className="text-xl">Track Company Career Openings</DialogTitle>
              <DialogDescription className="text-xs">
                Add any company (e.g. Nvidia, Konami, Stripe, TCS). Our AI agent will inspect their portal, Workday, or ATS board to fetch exact live roles.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Live Logo Preview + Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2.5">
                  <CompanyLogo company={companyName || "Company"} jobUrl={careersUrl} size="md" />
                  <div className="relative flex-1">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="e.g. Nvidia, Konami, Stripe, TCS"
                      className="pl-9 text-xs"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Careers URL (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="careersUrl" className="text-xs font-semibold">
                    Careers Page / ATS URL <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <span className="text-[10px] text-primary">Auto-discovered if blank</span>
                </div>
                <div className="relative">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="careersUrl"
                    placeholder="e.g. https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite"
                    className="pl-9 text-xs font-mono"
                    value={careersUrl}
                    onChange={(e) => setCareersUrl(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Leave blank to auto-discover, or paste a specific Workday, Paycom, Greenhouse, or Ashby link.
                </p>
              </div>

              {/* Target Roles (Optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="targetRoles" className="text-xs font-semibold">
                  Target Roles / Keywords <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetRoles"
                    placeholder="e.g. Software Engineer, React, AI, Systems Engineer"
                    className="pl-9 text-xs"
                    value={targetRolesInput}
                    onChange={(e) => setTargetRolesInput(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Comma-separated keywords for prioritized AI matching against your resume.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Fetching Live Roles...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Start Ingesting Jobs
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
