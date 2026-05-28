"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateReleaseStatus, enableReleaseShare, disableReleaseShare } from "../actions/release-actions";
import { MoreHorizontal, Link2, Link2Off } from "lucide-react";
import { format } from "date-fns";
import type { ReleaseStatus } from "@prisma/client";

const STATUS_BADGE: Record<ReleaseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PLANNED: { label: "Planned", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  RELEASED: { label: "Released", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

const NEXT_STATUSES: Record<ReleaseStatus, ReleaseStatus[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RELEASED", "CANCELLED"],
  RELEASED: [],
  CANCELLED: ["PLANNED"],
};

interface Release {
  id: string;
  name: string;
  version: string | null;
  status: ReleaseStatus;
  targetDate: Date | null;
  shareEnabled: boolean;
  shareToken: string | null;
  _count: { testRuns: number; defects: number };
}

interface Props {
  releases: Release[];
  orgId: string;
  appUrl: string;
}

export function ReleasesTable({ releases, orgId, appUrl }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(releaseId: string, status: ReleaseStatus) {
    startTransition(async () => {
      await updateReleaseStatus(releaseId, orgId, status);
      router.refresh();
    });
  }

  function handleToggleShare(release: Release) {
    startTransition(async () => {
      if (release.shareEnabled) {
        await disableReleaseShare(release.id, orgId);
      } else {
        await enableReleaseShare(release.id, orgId);
      }
      router.refresh();
    });
  }

  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No releases yet. Create your first release to start tracking quality.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Target date</TableHead>
            <TableHead>Runs</TableHead>
            <TableHead>Share</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {releases.map((release) => {
            const badge = STATUS_BADGE[release.status];
            const shareUrl = release.shareToken ? `${appUrl}/share/release/${release.shareToken}` : null;
            return (
              <TableRow key={release.id}>
                <TableCell className="font-medium">{release.name}</TableCell>
                <TableCell className="text-muted-foreground">{release.version ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {release.targetDate ? format(new Date(release.targetDate), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{release._count.testRuns}</TableCell>
                <TableCell>
                  {release.shareEnabled && shareUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-primary"
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Copy link
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Off</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {NEXT_STATUSES[release.status].map((s) => (
                        <DropdownMenuItem key={s} onClick={() => handleStatusChange(release.id, s)}>
                          Mark as {STATUS_BADGE[s].label}
                        </DropdownMenuItem>
                      ))}
                      {NEXT_STATUSES[release.status].length > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={() => handleToggleShare(release)}>
                        {release.shareEnabled ? (
                          <><Link2Off className="h-4 w-4 mr-2" />Revoke share link</>
                        ) : (
                          <><Link2 className="h-4 w-4 mr-2" />Enable share link</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
