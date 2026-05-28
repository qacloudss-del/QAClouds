import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome to {org?.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hi {user?.name?.split(" ")[0]} — your QA workspace is ready.
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Project dashboards, test case management, and execution tracking are
          coming in the next epic. Check{" "}
          <a href={`/${orgSlug}/settings/members`} className="underline underline-offset-2">
            Members
          </a>{" "}
          or{" "}
          <a href={`/${orgSlug}/settings`} className="underline underline-offset-2">
            Settings
          </a>{" "}
          in the sidebar.
        </p>
      </div>
    </div>
  );
}
