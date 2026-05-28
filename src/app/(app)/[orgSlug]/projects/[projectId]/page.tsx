import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TestTube, Play, Bug, Tag } from "lucide-react";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          testCases: { where: { deletedAt: null } },
          testRuns: { where: { deletedAt: null } },
          defects: { where: { deletedAt: null } },
          releases: { where: { deletedAt: null } },
        },
      },
    },
  });
  if (!project) notFound();

  const stats = [
    { label: "Test cases", value: project._count.testCases, icon: TestTube, href: `/${orgSlug}/projects/${projectId}/test-cases` },
    { label: "Test runs", value: project._count.testRuns, icon: Play, href: `/${orgSlug}/projects/${projectId}/test-runs` },
    { label: "Defects", value: project._count.defects, icon: Bug, href: `/${orgSlug}/projects/${projectId}/defects` },
    { label: "Releases", value: project._count.releases, icon: Tag, href: `/${orgSlug}/projects/${projectId}/releases` },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-muted-foreground">{project.description ?? "No description."}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </div>
            <span className="text-2xl font-semibold">{value}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Dashboard charts and execution trends coming in Epic 9 (Reporting).
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/${orgSlug}/projects/${projectId}/releases`}>View releases →</Link>
        </Button>
      </div>
    </div>
  );
}
