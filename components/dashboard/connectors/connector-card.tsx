"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cable, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toggleConnector } from "@/lib/actions/connector-actions";
import { refreshSingleConnector } from "@/lib/actions/jobs-actions";

interface ConnectorProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  websiteUrl: string;
  logoUrl?: string | null;
  status: string;
  jobCount: number;
  lastFetchedAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
  enabled: boolean;
}

export function ConnectorCard({ connector }: { connector: ConnectorProps }) {
  const [enabled, setEnabled] = useState(connector.enabled);
  const [isToggling, setIsToggling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isConnected = connector.status === "connected";
  const isRequiresConfig = connector.status === "requires_config";
  const isComingSoon = connector.status === "coming_soon";

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    setIsToggling(true);
    try {
      await toggleConnector(connector.id, checked);
    } catch {
      setEnabled(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSync = async () => {
    if (!isConnected || isSyncing) return;
    setIsSyncing(true);
    try {
      await refreshSingleConnector(connector.slug);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-200 hover:border-border hover:shadow-md">
      <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
        <div>
          {/* Header row: Icon, Name, Badge, Toggle */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold shadow-sm">
                <Cable className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight tracking-tight text-foreground flex items-center gap-2">
                  {connector.name}
                  <a
                    href={connector.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
                  </a>
                </h3>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {connector.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={enabled && isConnected}
                disabled={!isConnected || isToggling}
                onCheckedChange={handleToggle}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1">
            {connector.description}
          </p>
        </div>

        {/* Status and Stats Footer */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-normal py-0.5">
                <CheckCircle2 className="h-3 w-3" /> Active ({connector.jobCount} jobs)
              </Badge>
            )}
            {isRequiresConfig && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 font-normal py-0.5">
                <AlertCircle className="h-3 w-3" /> Requires Key
              </Badge>
            )}
            {isComingSoon && (
              <Badge variant="outline" className="bg-muted text-muted-foreground gap-1 font-normal py-0.5">
                <Clock className="h-3 w-3" /> Coming Soon
              </Badge>
            )}
          </div>

          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isSyncing}
              onClick={handleSync}
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
