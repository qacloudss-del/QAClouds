import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AppSidebar } from "@/features/organizations/components/AppSidebar";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const userOrgs = await db.organizationMember.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        org={org}
        userRole={membership.role}
        allOrgs={userOrgs.map((m) => m.organization)}
        user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
