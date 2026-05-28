import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { ProjectMembersManager } from "@/features/projects/components/ProjectMembersManager";

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [projectMembers, orgMembers] = await Promise.all([
    db.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    db.organizationMember.findMany({
      where: { organizationId: org.id, status: "ACTIVE" },
      include: { user: true },
    }),
  ]);

  const projectMemberUserIds = new Set(projectMembers.map((m) => m.userId));
  const availableOrgMembers = orgMembers.filter(
    (m) => m.userId && !projectMemberUserIds.has(m.userId)
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-medium">Project members</h2>
        <p className="text-sm text-muted-foreground">
          Control who has access to this project and at what role.
        </p>
      </div>
      <Separator />
      <ProjectMembersManager
        projectId={projectId}
        orgId={org.id}
        projectMembers={projectMembers}
        availableOrgMembers={availableOrgMembers.map((m) => ({
          userId: m.userId!,
          name: m.user?.name ?? m.invitedEmail ?? "Unknown",
          email: m.user?.email ?? "",
          avatarUrl: m.user?.avatarUrl ?? null,
        }))}
        currentUserId={user.id}
      />
    </div>
  );
}
