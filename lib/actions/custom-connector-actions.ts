"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/auth";
import { ingestCustomCompanyJobs } from "@/lib/connectors/custom-career-scraper";
import { getCompanyLogoUrls } from "@/lib/utils/company-logo";
import { revalidatePath } from "next/cache";

export interface CustomConnectorData {
  id: string;
  companyName: string;
  careersUrl: string;
  logoUrl?: string | null;
  targetRoles: string[];
  status: string;
  jobCount: number;
  lastSyncedAt?: Date | null;
  lastError?: string | null;
  createdAt: Date;
}

/**
 * Creates a new custom company connector and kicks off an initial sync.
 */
export async function addCustomCompanyConnector(data: {
  companyName: string;
  careersUrl: string;
  targetRoles?: string[];
}) {
  try {
    const user = await requireAuth();

    let url = data.careersUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const companyName = data.companyName.trim();
    const logoUrl = getCompanyLogoUrls(companyName, null, url)[0] || null;
    const id = `cust_conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const targetRoles = data.targetRoles || [];

    // Use raw query for resilient insertion even if Prisma client engine wasn't re-generated
    await prisma.$executeRawUnsafe(
      `INSERT INTO custom_company_connectors (id, user_id, company_name, careers_url, logo_url, target_roles, status, job_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      id,
      user.id,
      companyName,
      url,
      logoUrl,
      targetRoles,
      "syncing",
      0
    );

    const connector = {
      id,
      userId: user.id,
      companyName,
      careersUrl: url,
      logoUrl,
      targetRoles,
      status: "syncing",
      jobCount: 0,
    };

    // Run initial ingestion in background
    ingestCustomCompanyJobs(connector.id, user.id)
      .then(() => {
        revalidatePath("/dashboard/connectors");
        revalidatePath("/dashboard/jobs");
        revalidatePath("/dashboard");
      })
      .catch((err) => console.error("Initial custom sync error:", err));

    revalidatePath("/dashboard/connectors");
    return { success: true, connector };
  } catch (error: any) {
    console.error("Error in addCustomCompanyConnector:", error);
    return { success: false, error: error.message || "Failed to create custom connector" };
  }
}

/**
 * Returns all custom connectors created by the current user.
 */
export async function getCustomCompanyConnectors(): Promise<CustomConnectorData[]> {
  try {
    const user = await requireAuth();

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, company_name as "companyName", careers_url as "careersUrl", logo_url as "logoUrl", target_roles as "targetRoles", status, job_count as "jobCount", last_synced_at as "lastSyncedAt", last_error as "lastError", created_at as "createdAt"
       FROM custom_company_connectors
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      user.id
    );

    return rows.map((c: any) => ({
      id: c.id,
      companyName: c.companyName,
      careersUrl: c.careersUrl,
      logoUrl: c.logoUrl,
      targetRoles: Array.isArray(c.targetRoles) ? c.targetRoles : [],
      status: c.status,
      jobCount: Number(c.jobCount) || 0,
      lastSyncedAt: c.lastSyncedAt ? new Date(c.lastSyncedAt) : null,
      lastError: c.lastError,
      createdAt: new Date(c.createdAt),
    }));
  } catch (error) {
    console.error("Error in getCustomCompanyConnectors:", error);
    return [];
  }
}

/**
 * Manually re-syncs an existing custom company connector.
 */
export async function syncCustomCompanyConnector(connectorId: string) {
  try {
    const user = await requireAuth();

    const result = await ingestCustomCompanyJobs(connectorId, user.id);

    revalidatePath("/dashboard/connectors");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");

    return result;
  } catch (error: any) {
    console.error("Error syncing custom connector:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a custom company connector.
 */
export async function deleteCustomCompanyConnector(connectorId: string) {
  try {
    const user = await requireAuth();

    await prisma.$executeRawUnsafe(
      `DELETE FROM custom_company_connectors WHERE id = $1 AND user_id = $2`,
      connectorId,
      user.id
    );

    revalidatePath("/dashboard/connectors");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting custom connector:", error);
    return { success: false, error: error.message };
  }
}
