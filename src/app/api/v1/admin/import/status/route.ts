/**
 * WA Import Status API
 *
 * Provides operational visibility into Wild Apricot sync state.
 *
 * GET /api/v1/admin/import/status
 *   Returns: Sync state, entity counts, last sync timestamps
 *
 * Authorization: Requires admin:full capability
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapabilitySafe } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runPreflightChecks, detectStaleRecords } from "@/lib/importing/wildapricot";

interface SyncStats {
  members: {
    total: number;
    mapped: number;
    lastSynced: string | null;
  };
  events: {
    total: number;
    mapped: number;
    lastSynced: string | null;
  };
  registrations: {
    total: number;
    mapped: number;
    lastSynced: string | null;
  };
}

export async function GET(req: NextRequest) {
  // Require full admin access for import status
  // Uses requireCapabilitySafe to block action during impersonation (Issue #233)
  const auth = await requireCapabilitySafe(req, "admin:full");
  if (!auth.ok) return auth.response;

  try {
    // Run preflight checks
    const preflight = await runPreflightChecks();

    // Get sync state
    const syncState = await prisma.waSyncState.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // Get entity counts and mapping stats
    const [
      memberCount,
      eventCount,
      registrationCount,
      memberMappings,
      eventMappings,
      registrationMappings,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.event.count(),
      prisma.eventRegistration.count(),
      prisma.waIdMapping.findMany({
        where: { entityType: "Member" },
        select: { syncedAt: true },
        orderBy: { syncedAt: "desc" },
        take: 1,
      }),
      prisma.waIdMapping.findMany({
        where: { entityType: "Event" },
        select: { syncedAt: true },
        orderBy: { syncedAt: "desc" },
        take: 1,
      }),
      prisma.waIdMapping.findMany({
        where: { entityType: "EventRegistration" },
        select: { syncedAt: true },
        orderBy: { syncedAt: "desc" },
        take: 1,
      }),
    ]);

    // Get mapping counts
    const [memberMappedCount, eventMappedCount, registrationMappedCount] =
      await Promise.all([
        prisma.waIdMapping.count({ where: { entityType: "Member" } }),
        prisma.waIdMapping.count({ where: { entityType: "Event" } }),
        prisma.waIdMapping.count({ where: { entityType: "EventRegistration" } }),
      ]);

    const stats: SyncStats = {
      members: {
        total: memberCount,
        mapped: memberMappedCount,
        lastSynced: memberMappings[0]?.syncedAt?.toISOString() || null,
      },
      events: {
        total: eventCount,
        mapped: eventMappedCount,
        lastSynced: eventMappings[0]?.syncedAt?.toISOString() || null,
      },
      registrations: {
        total: registrationCount,
        mapped: registrationMappedCount,
        lastSynced: registrationMappings[0]?.syncedAt?.toISOString() || null,
      },
    };

    // Detect stale records (not synced in 7 days)
    const staleRecords = await detectStaleRecords(7);

    return NextResponse.json({
      preflight: {
        ok: preflight.ok,
        checks: preflight.checks,
        missingStatuses: preflight.missingStatuses,
        error: preflight.error,
      },
      syncState: syncState
        ? {
            lastFullSync: syncState.lastFullSync?.toISOString() || null,
            lastIncSync: syncState.lastIncSync?.toISOString() || null,
            lastContactSync: syncState.lastContactSync?.toISOString() || null,
            lastEventSync: syncState.lastEventSync?.toISOString() || null,
            lastRegSync: syncState.lastRegSync?.toISOString() || null,
            updatedAt: syncState.updatedAt.toISOString(),
          }
        : null,
      stats,
      staleRecords: {
        threshold: staleRecords.threshold.toISOString(),
        staleDaysThreshold: staleRecords.staleDaysThreshold,
        counts: {
          members: staleRecords.staleMembers.length,
          events: staleRecords.staleEvents.length,
          registrations: staleRecords.staleRegistrations.length,
        },
      },
    });
  } catch (error) {
    console.error("Import status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
