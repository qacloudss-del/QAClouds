import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getReleases } from "@/features/releases/actions/release-actions";
import { ReleasesTable } from "@/features/releases/components/ReleasesTable";
import { CreateReleaseModal } from "@/features/releases/components/CreateReleaseModal";
import { checkPermission } from "@/lib/rbac";

export default async function ReleasesPage({
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

  const releases = await getReleases(projectId);
  const { allowed: canManage } = await checkPermission(user.id, org.id, "can_manage_projects", projectId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Releases</h2>
          <p className="text-sm text-muted-foreground">{releases.length} release{releases.length !== 1 ? "s" : ""}</p>
        </div>
        {canManage && <CreateReleaseModal projectId={projectId} orgId={org.id} />}
      </div>
      <ReleasesTable releases={releases} orgId={org.id} appUrl={appUrl} />
    </div>
  );
}
