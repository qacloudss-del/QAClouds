"use server";

import { createId } from "@paralleldrive/cuid2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import {
  UpdateOrgSchema,
  InviteMemberSchema,
  type UpdateOrgInput,
  type InviteMemberInput,
} from "../schemas/org-schemas";
import type { OrgRole } from "@prisma/client";

export async function getOrgBySlug(slug: string) {
  return db.organization.findUnique({ where: { slug } });
}

export async function getUserOrgs(userId: string) {
  const memberships = await db.organizationMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ ...m.organization, role: m.role }));
}

export async function getOrgMembership(userId: string, orgId: string) {
  return db.organizationMember.findFirst({
    where: { userId, organizationId: orgId, status: "ACTIVE" },
  });
}

export async function updateOrgSettings(orgId: string, input: UpdateOrgInput) {
  const parsed = UpdateOrgSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input" };

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_org_settings");

  const org = await db.organization.update({
    where: { id: orgId },
    data: { name: parsed.data.name, timezone: parsed.data.timezone },
  });
  return { success: true as const, data: org };
}

export async function getOrgMembers(orgId: string) {
  const { userId } = await requireAuth();
  const membership = await getOrgMembership(userId, orgId);
  if (!membership) return { success: false as const, error: "Not a member" };

  const members = await db.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return { success: true as const, data: members };
}

export async function inviteMember(orgId: string, input: InviteMemberInput) {
  const parsed = InviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_members");

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return { success: false as const, error: "Organization not found" };

  // Seat limit check
  const activeCount = await db.organizationMember.count({
    where: { organizationId: orgId, status: "ACTIVE" },
  });
  if (org.plan === "FREE" && activeCount >= org.seatLimit) {
    return { success: false as const, error: "SEAT_LIMIT_REACHED" };
  }

  // Check not already a member
  const existing = await db.organizationMember.findFirst({
    where: { organizationId: orgId, invitedEmail: parsed.data.email },
  });
  if (existing) return { success: false as const, error: "Already invited or a member" };

  const token = createId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await db.organizationMember.create({
    data: {
      organizationId: orgId,
      role: parsed.data.role,
      status: "PENDING",
      invitedEmail: parsed.data.email,
      invitedByUserId: userId,
      inviteToken: token,
      inviteExpiresAt: expiresAt,
    },
  });

  // Send email if Resend is configured — otherwise log invite URL
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@qaclouds.com",
        to: parsed.data.email,
        subject: `You've been invited to ${org.name} on QAClouds`,
        html: `<p>You've been invited to join <strong>${org.name}</strong> on QAClouds as a <strong>${parsed.data.role.replace("_", " ").toLowerCase()}</strong>.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>This link expires in 7 days.</p>`,
      });
    } catch {
      // Email failure is non-fatal; invite record was created
    }
  } else {
    console.log(`[INVITE] ${parsed.data.email} → ${inviteUrl}`);
  }

  return { success: true as const, data: invite, inviteUrl };
}

export async function updateMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: OrgRole
) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_members");

  if (newRole === "OWNER") {
    return { success: false as const, error: "Cannot assign Owner role via this action" };
  }

  const target = await db.organizationMember.findFirst({
    where: { userId: targetUserId, organizationId: orgId, status: "ACTIVE" },
  });
  if (!target) return { success: false as const, error: "Member not found" };
  if (target.role === "OWNER") {
    return { success: false as const, error: "Cannot change role of the Owner" };
  }

  const updated = await db.organizationMember.update({
    where: { id: target.id },
    data: { role: newRole },
  });
  return { success: true as const, data: updated };
}

export async function removeMember(orgId: string, targetUserId: string) {
  const { userId } = await requireAuth();
  await requirePermission(userId, orgId, "can_manage_members");

  // Prevent removing the last owner
  if (targetUserId === userId) {
    const ownerCount = await db.organizationMember.count({
      where: { organizationId: orgId, role: "OWNER", status: "ACTIVE" },
    });
    if (ownerCount <= 1) {
      return { success: false as const, error: "Organization must have at least one owner" };
    }
  }

  const target = await db.organizationMember.findFirst({
    where: { userId: targetUserId, organizationId: orgId, status: "ACTIVE" },
  });
  if (!target) return { success: false as const, error: "Member not found" };

  // Remove from org and all projects
  await db.$transaction([
    db.organizationMember.delete({ where: { id: target.id } }),
    db.projectMember.deleteMany({
      where: {
        userId: targetUserId,
        project: { organizationId: orgId },
      },
    }),
  ]);

  return { success: true as const };
}

export async function acceptInvite(token: string) {
  const { userId } = await requireAuth();

  const invite = await db.organizationMember.findUnique({
    where: { inviteToken: token },
    include: { organization: true },
  });

  if (!invite) return { success: false as const, error: "Invitation not found" };
  if (invite.status !== "PENDING") return { success: false as const, error: "Invitation already used" };
  if (invite.inviteExpiresAt && invite.inviteExpiresAt < new Date()) {
    return { success: false as const, error: "Invitation has expired" };
  }

  await db.organizationMember.update({
    where: { id: invite.id },
    data: { userId, status: "ACTIVE", joinedAt: new Date(), inviteToken: null },
  });

  return { success: true as const, orgSlug: invite.organization.slug };
}
