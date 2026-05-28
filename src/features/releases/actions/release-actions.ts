"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import {
  CreateReleaseSchema,
  UpdateReleaseStatusSchema,
  type CreateReleaseInput,
} from "../schemas/release-schemas";
import type { ReleaseStatus } from "@prisma/client";

export async function getReleases(projectId: string) {
  return db.release.findMany({
    where: { projectId, deletedAt: null },
    include: {
      _count: { select: { testRuns: true, defects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRelease(
  projectId: string,
  orgId: string,
  input: CreateReleaseInput
) {
  const parsed = CreateReleaseSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  const release = await db.release.create({
    data: {
      projectId,
      organizationId: orgId,
      name: parsed.data.name,
      version: parsed.data.version,
      description: parsed.data.description,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      createdByUserId: userId,
    },
  });
  return { success: true as const, data: release };
}

export async function updateReleaseStatus(
  releaseId: string,
  orgId: string,
  status: ReleaseStatus
) {
  const parsed = UpdateReleaseStatusSchema.safeParse({ status });
  if (!parsed.success) return { success: false as const, error: "Invalid status" };

  const { userId } = await requireAuth();
  const release = await db.release.findUnique({ where: { id: releaseId } });
  if (!release) return { success: false as const, error: "Release not found" };

  await requirePermission(userId, orgId, "can_manage_projects", release.projectId);

  const updated = await db.release.update({
    where: { id: releaseId },
    data: { status: parsed.data.status },
  });
  return { success: true as const, data: updated };
}

export async function enableReleaseShare(releaseId: string, orgId: string) {
  const { userId } = await requireAuth();
  const release = await db.release.findUnique({ where: { id: releaseId } });
  if (!release) return { success: false as const, error: "Release not found" };

  await requirePermission(userId, orgId, "can_manage_projects", release.projectId);

  const token = crypto.randomBytes(32).toString("hex");
  const updated = await db.release.update({
    where: { id: releaseId },
    data: { shareToken: token, shareEnabled: true },
  });
  return { success: true as const, data: updated };
}

export async function disableReleaseShare(releaseId: string, orgId: string) {
  const { userId } = await requireAuth();
  const release = await db.release.findUnique({ where: { id: releaseId } });
  if (!release) return { success: false as const, error: "Release not found" };

  await requirePermission(userId, orgId, "can_manage_projects", release.projectId);

  const updated = await db.release.update({
    where: { id: releaseId },
    data: { shareToken: null, shareEnabled: false },
  });
  return { success: true as const, data: updated };
}
