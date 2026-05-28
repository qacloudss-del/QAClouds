import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { EnvironmentsList } from "@/features/environments/components/EnvironmentsList";
import { getEnvironments } from "@/features/environments/actions/env-actions";

export default async function EnvironmentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const environments = await getEnvironments(projectId);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-medium">Environments</h2>
        <p className="text-sm text-muted-foreground">
          Deployment targets for your test runs (e.g. Staging, Production, QA).
        </p>
      </div>
      <Separator />
      <EnvironmentsList environments={environments} projectId={projectId} orgId={org.id} />
    </div>
  );
}
