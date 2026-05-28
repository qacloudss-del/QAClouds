"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { CreateEnvironmentSchema, type CreateEnvironmentInput } from "../schemas/env-schemas";

export async function getEnvironments(projectId: string) {
  return db.environment.findMany({
    where: { projectId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createEnvironment(
  projectId: string,
  orgId: string,
  input: CreateEnvironmentInput
) {
  const parsed = CreateEnvironmentSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  // If new env is default, unset others
  if (parsed.data.isDefault) {
    await db.environment.updateMany({
      where: { projectId },
      data: { isDefault: false },
    });
  }

  const env = await db.environment.create({
    data: {
      projectId,
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color,
      isDefault: parsed.data.isDefault,
    },
  });
  return { success: true as const, data: env };
}

export async function setDefaultEnvironment(envId: string, projectId: string, orgId: string) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  await db.$transaction([
    db.environment.updateMany({ where: { projectId }, data: { isDefault: false } }),
    db.environment.update({ where: { id: envId }, data: { isDefault: true } }),
  ]);
  return { success: true as const };
}

export async function deleteEnvironment(envId: string, projectId: string, orgId: string) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  const runCount = await db.testRun.count({ where: { environmentId: envId } });
  if (runCount > 0) {
    return {
      success: false as const,
      error: `Cannot delete — ${runCount} test run${runCount > 1 ? "s" : ""} use this environment`,
    };
  }

  await db.environment.delete({ where: { id: envId } });
  return { success: true as const };
}
