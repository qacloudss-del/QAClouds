import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ReleaseStatus } from "@prisma/client";

const STATUS_BADGE: Record<ReleaseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PLANNED: { label: "Planned", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  RELEASED: { label: "Released", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function PublicReleasePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const release = await db.release.findFirst({
    where: { shareToken: token, shareEnabled: true },
    include: {
      project: { select: { name: true, color: true } },
      testRuns: {
        select: { id: true, name: true, status: true },
        where: { deletedAt: null },
      },
      defects: {
        select: { id: true, severity: true, status: true },
        where: { deletedAt: null, status: { in: ["OPEN", "IN_PROGRESS"] } },
      },
    },
  });

  if (!release) notFound();

  const badge = STATUS_BADGE[release.status];
  const criticalDefects = release.defects.filter((d) => d.severity === "CRITICAL").length;
  const completedRuns = release.testRuns.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: release.project.color }} />
            <span>{release.project.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{release.name}</h1>
            {release.version && <span className="text-muted-foreground">{release.version}</span>}
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          {release.targetDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Target: {format(new Date(release.targetDate), "MMMM d, yyyy")}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-semibold">{release.testRuns.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Test runs</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-semibold">{completedRuns}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Completed</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className={`text-2xl font-semibold ${criticalDefects > 0 ? "text-destructive" : ""}`}>
              {criticalDefects}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Critical defects</div>
          </div>
        </div>

        {/* Test runs */}
        {release.testRuns.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Test runs</h2>
            <div className="rounded-lg border divide-y">
              {release.testRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm">{run.name}</span>
                  <Badge variant={run.status === "COMPLETED" ? "secondary" : "outline"} className="text-xs">
                    {run.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Shared via QAClouds · Read-only view
        </p>
      </div>
    </div>
  );
}
