import { getConnectorsWithUserStatus } from "@/lib/actions/connector-actions";
import { ConnectorCard } from "@/components/dashboard/connectors/connector-card";
import { Cable, Layers, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Connectors | JobBuddy AI",
  description: "Manage and configure live job sources and ATS connectors.",
};

export default async function ConnectorsPage() {
  const connectors = await getConnectorsWithUserStatus();

  const activeCount = connectors.filter((c) => c.status === "connected" && c.enabled).length;
  const totalJobs = connectors.reduce((acc, c) => acc + c.jobCount, 0);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Cable className="h-8 w-8 text-primary" /> Job Connectors
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Configure the platforms and applicant tracking systems your AI Agent continuously monitors for opportunities.
          </p>
        </div>

        {/* Global stats pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-card/80 border border-border px-3.5 py-1.5 text-xs font-medium shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              <strong className="text-foreground">{activeCount}</strong> of {connectors.length} Active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card/80 border border-border px-3.5 py-1.5 text-xs font-medium shadow-sm">
            <Layers className="h-4 w-4 text-primary" />
            <span>
              <strong className="text-foreground">{totalJobs}</strong> Discovered
            </span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3.5 text-sm text-muted-foreground">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-foreground">Multi-source Synchronization</p>
          <p className="mt-0.5 text-xs leading-relaxed">
            All connected ATS platforms sync real-time postings directly from company career pages without scraping or outdated aggregates. Custom enterprise connectors can be activated with dedicated keys.
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
  );
}
