"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import {
  CreateOrgSchema,
  CreateProjectSchema,
  type CreateOrgInput,
  type CreateProjectInput,
} from "../schemas/onboarding-schemas";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export async function syncAndGetUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (existing) return existing;

  return db.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
      avatarUrl: clerkUser.imageUrl,
    },
  });
}

export async function getUserOnboardingState() {
  const user = await syncAndGetUser();
  if (!user) return null;

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { organization: { include: { projects: { take: 1 } } } },
    orderBy: { createdAt: "asc" },
  });

  return {
    user,
    organization: membership?.organization ?? null,
    project: membership?.organization?.projects[0] ?? null,
  };
}

export async function createOrganization(input: CreateOrgInput) {
  const parsed = CreateOrgSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid organization name" };
  }

  const user = await syncAndGetUser();
  if (!user) return { success: false as const, error: "Not authenticated" };

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await db.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const org = await db.organization.create({
    data: {
      clerkOrgId: createId(),
      name: parsed.data.name,
      slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      },
    },
  });

  return { success: true as const, data: org };
}

export async function createProject(
  orgId: string,
  input: CreateProjectInput
) {
  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid project name" };
  }

  const user = await syncAndGetUser();
  if (!user) return { success: false as const, error: "Not authenticated" };

  const member = await db.organizationMember.findFirst({
    where: { userId: user.id, organizationId: orgId, status: "ACTIVE" },
  });
  if (!member) return { success: false as const, error: "Not a member" };

  const project = await db.project.create({
    data: {
      organizationId: orgId,
      name: parsed.data.name,
      color: parsed.data.color,
      createdByUserId: user.id,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  return { success: true as const, data: project };
}
