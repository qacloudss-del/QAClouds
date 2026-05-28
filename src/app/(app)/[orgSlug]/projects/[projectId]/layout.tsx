import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: org.id, deletedAt: null },
  });
  if (!project) notFound();

  const { allowed } = await checkPermission(user.id, org.id, "can_view_reports", projectId);
  if (!allowed) notFound();

  const { allowed: canManage } = await checkPermission(user.id, org.id, "can_manage_projects", projectId);

  const base = `/${orgSlug}/projects/${projectId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/test-cases`, label: "Test Cases" },
    { href: `${base}/test-suites`, label: "Suites" },
    { href: `${base}/test-runs`, label: "Runs" },
    { href: `${base}/releases`, label: "Releases" },
    { href: `${base}/defects`, label: "Defects" },
    { href: `${base}/reports`, label: "Reports" },
    ...(canManage ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Project header */}
      <div className="border-b px-6 pt-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="font-semibold text-base">{project.name}</h1>
          {project.status === "ARCHIVED" && (
            <Badge variant="secondary" className="text-[10px]">Archived</Badge>
          )}
        </div>
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-sm whitespace-nowrap border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
