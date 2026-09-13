"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/auth";
import { CONNECTORS_METADATA } from "@/lib/connectors/registry";
import { revalidatePath } from "next/cache";

/**
 * Ensures all connectors from CONNECTORS_METADATA exist in the database.
 */
export async function seedConnectorSources() {
  for (const meta of CONNECTORS_METADATA) {
    await prisma.connectorSource.upsert({
      where: { slug: meta.slug },
      update: {
        name: meta.name,
        description: meta.description,
        category: meta.category,
        websiteUrl: meta.websiteUrl,
        logoUrl: meta.logoUrl,
        status: meta.status,
      },
      create: {
        slug: meta.slug,
        name: meta.name,
        description: meta.description,
        category: meta.category,
        websiteUrl: meta.websiteUrl,
        logoUrl: meta.logoUrl,
        status: meta.status,
      },
    });
  }
}

/**
 * Returns all connector sources with user preferences attached.
 */
export async function getConnectorsWithUserStatus() {
  const user = await requireAuth();

  // Ensure DB seed exists
  await seedConnectorSources();

  const sources = await prisma.connectorSource.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      userPrefs: {
        where: { userId: user.id },
      },
      _count: {
        select: { jobSources: true },
      },
    },
  });

  return sources.map((s) => {
    const pref = s.userPrefs[0];
    const isEnabled = pref !== undefined ? pref.enabled : s.status === "connected";

    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      category: s.category,
      websiteUrl: s.websiteUrl,
      logoUrl: s.logoUrl,
      status: s.status,
      jobCount: s._count.jobSources,
      lastFetchedAt: s.lastFetchedAt,
      lastErrorAt: s.lastErrorAt,
      lastError: s.lastError,
      enabled: isEnabled,
    };
  });
}

/**
 * Toggles a user's connector preference on or off.
 */
export async function toggleConnector(connectorId: string, enabled: boolean) {
  const user = await requireAuth();

  await prisma.userConnectorPref.upsert({
    where: {
      userId_connectorId: {
        userId: user.id,
        connectorId,
      },
    },
    update: { enabled },
    create: {
      userId: user.id,
      connectorId,
      enabled,
    },
  });

  revalidatePath("/dashboard/connectors");
  revalidatePath("/dashboard/jobs");
  return { success: true, enabled };
}

/**
 * Enables or disables all connectors for the user.
 */
export async function toggleAllConnectors(enabled: boolean) {
  const user = await requireAuth();
  const allSources = await prisma.connectorSource.findMany();

  for (const s of allSources) {
    await prisma.userConnectorPref.upsert({
      where: {
        userId_connectorId: {
          userId: user.id,
          connectorId: s.id,
        },
      },
      update: { enabled },
      create: {
        userId: user.id,
        connectorId: s.id,
        enabled,
      },
    });
  }

  revalidatePath("/dashboard/connectors");
  revalidatePath("/dashboard/jobs");
  return { success: true };
}
