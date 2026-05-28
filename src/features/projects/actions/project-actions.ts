"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission, checkPermission } from "@/lib/rbac";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  AddProjectMemberSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type AddProjectMemberInput,
} from "../schemas/project-schemas";
import type { OrgRole } from "@prisma/client";

export async function getProjectsForOrg(orgId: string) {
  const { userId } = await requireAuth();
  const membership = await db.organizationMember.findFirst({
    where: { userId, organizationId: orgId, status: "ACTIVE" },
  });
  if (!membership) return [];

  // Owners/Admins/QA Managers see all projects; others see only their projects
  const isOrgWideAccess = ["OWNER", "ADMIN", "QA_MANAGER"].includes(membership.role);

  if (isOrgWideAccess) {
    return db.project.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        _count: { select: { testCases: true, testRuns: true, members: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  return db.project.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      members: { some: { userId } },
    },
    include: {
      _count: { select: { testCases: true, testRuns: true, members: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProjectById(projectId: string, orgId: string) {
  return db.project.findFirst({
    where: { id: projectId, organizationId: orgId, deletedAt: null },
  });
}

export async function createProject(orgId: string, input: CreateProjectInput) {
  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects");

  const project = await db.project.create({
    data: {
      organizationId: orgId,
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color,
      createdByUserId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
  });
  return { success: true as const, data: project };
}

export async function updateProject(
  projectId: string,
  orgId: string,
  input: UpdateProjectInput
) {
  const parsed = UpdateProjectSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  const project = await db.project.update({
    where: { id: projectId },
    data: { name: parsed.data.name, description: parsed.data.description, color: parsed.data.color },
  });
  return { success: true as const, data: project };
}

export async function archiveProject(projectId: string, orgId: string) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  await db.project.update({
    where: { id: projectId },
    data: { status: "ARCHIVED" },
  });
  return { success: true as const };
}

export async function unarchiveProject(projectId: string, orgId: string) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  await db.project.update({
    where: { id: projectId },
    data: { status: "ACTIVE" },
  });
  return { success: true as const };
}

export async function getProjectMembers(projectId: string, orgId: string) {
  const { userId } = await requireAuth();
  const { allowed } = await checkPermission(userId, orgId, "can_view_reports", projectId);
  if (!allowed) return { success: false as const, error: "Access denied" };

  const members = await db.projectMember.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return { success: true as const, data: members };
}

export async function addProjectMember(
  projectId: string,
  orgId: string,
  input: AddProjectMemberInput
) {
  const parsed = AddProjectMemberSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  // Must be an org member
  const orgMember = await db.organizationMember.findFirst({
    where: { userId: parsed.data.userId, organizationId: orgId, status: "ACTIVE" },
  });
  if (!orgMember) return { success: false as const, error: "User is not an org member" };

  const member = await db.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
    create: { projectId, userId: parsed.data.userId, role: parsed.data.role as OrgRole },
    update: { role: parsed.data.role as OrgRole },
  });
  return { success: true as const, data: member };
}

export async function removeProjectMember(
  projectId: string,
  orgId: string,
  targetUserId: string
) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_projects", projectId);

  await db.projectMember.deleteMany({ where: { projectId, userId: targetUserId } });
  return { success: true as const };
}
