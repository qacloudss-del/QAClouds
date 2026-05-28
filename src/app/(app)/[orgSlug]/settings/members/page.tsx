import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { MembersTable } from "@/features/organizations/components/MembersTable";
import { InviteMemberModal } from "@/features/organizations/components/InviteMemberModal";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id, organizationId: org.id, status: "ACTIVE" },
  });
  if (!membership) notFound();

  const members = await db.organizationMember.findMany({
    where: { organizationId: org.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const canManageMembers = ["OWNER", "ADMIN"].includes(membership.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {org.plan === "FREE" && ` · ${org.seatLimit} seat limit on Free plan`}
          </p>
        </div>
        {canManageMembers && <InviteMemberModal orgId={org.id} />}
      </div>
      <Separator />
      <MembersTable
        orgId={org.id}
        members={members}
        currentUserId={user.id}
      />
    </div>
  );
}
