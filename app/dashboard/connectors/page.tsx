import { getConnectorsWithUserStatus } from "@/lib/actions/connector-actions";
import { getCustomCompanyConnectors } from "@/lib/actions/custom-connector-actions";
import { ConnectorCard } from "@/components/dashboard/connectors/connector-card";
import { AddCustomConnectorDialog } from "@/components/dashboard/connectors/add-custom-connector-dialog";
import { CustomConnectorsSection } from "@/components/dashboard/connectors/custom-connectors-section";
import { Cable, Layers, ShieldCheck, Sparkles, Building2 } from "lucide-react";

export const metadata = {
  title: "Connectors | JobBuddy AI",
  description: "Manage and configure live job sources, custom company career portals, and ATS connectors.",
};

export default async function ConnectorsPage() {
  const [connectors, customConnectors] = await Promise.all([
    getConnectorsWithUserStatus(),
    getCustomCompanyConnectors(),
  ]);

  const activeCount = connectors.filter((c) => c.status === "connected" && c.enabled).length;
  const customJobsCount = customConnectors.reduce((acc, c) => acc + c.jobCount, 0);
  const totalJobs = connectors.reduce((acc, c) => acc + c.jobCount, 0) + customJobsCount;

  return (
    <div className="flex-1 space-y-10 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Cable className="h-8 w-8 text-primary" /> Job Connectors
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Configure global applicant tracking systems and track your personalized custom company career portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global stats pills */}
          <div className="flex items-center gap-2 rounded-lg bg-card/80 border border-border px-3.5 py-1.5 text-xs font-medium shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              <strong className="text-foreground">{activeCount}</strong> ATS Active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card/80 border border-border px-3.5 py-1.5 text-xs font-medium shadow-sm">
            <Layers className="h-4 w-4 text-primary" />
            <span>
              <strong className="text-foreground">{totalJobs}</strong> Total Jobs
            </span>
          </div>

          <AddCustomConnectorDialog />
        </div>
      </div>

      {/* ─── Custom Company Connectors Section ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Your Custom Company Connectors
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct company career portals (e.g. TCS, Infosys, Stripe, Airbnb) being monitored specifically for you
            </p>
          </div>
        </div>

        <CustomConnectorsSection connectors={customConnectors} />
      </div>

      {/* ─── Global ATS Connectors Section ─────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Cable className="h-5 w-5 text-emerald-600" />
            Global ATS & Platform Connectors
          </h2>
          <p className="text-xs text-muted-foreground">
            Built-in ecosystem integrations discovering live openings across thousands of tech companies
          </p>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3.5 text-sm text-muted-foreground">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Multi-source Synchronization</p>
            <p className="mt-0.5 text-xs leading-relaxed">
              All connected ATS platforms sync real-time postings directly from company career boards without scraping or outdated aggregates.
            </p>
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectors.map((c) => (
            <ConnectorCard key={c.id} connector={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
