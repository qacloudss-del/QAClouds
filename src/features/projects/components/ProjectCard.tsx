"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, TestTube, Play, Users, Archive, ArchiveRestore } from "lucide-react";
import { archiveProject, unarchiveProject } from "../actions/project-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ProjectStatus } from "@prisma/client";

interface Props {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    status: ProjectStatus;
    _count: { testCases: number; testRuns: number; members: number };
  };
  orgId: string;
  orgSlug: string;
  canManage: boolean;
}

export function ProjectCard({ project, orgId, orgSlug, canManage }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isArchived = project.status === "ARCHIVED";

  function handleArchive() {
    startTransition(async () => {
      if (isArchived) {
        await unarchiveProject(project.id, orgId);
      } else {
        await archiveProject(project.id, orgId);
      }
      router.refresh();
    });
  }

  return (
    <div className="group rounded-lg border bg-card hover:shadow-sm transition-shadow overflow-hidden">
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: project.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/${orgSlug}/projects/${project.id}`}
              className="font-medium text-sm hover:underline underline-offset-2 truncate block"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isArchived && (
              <Badge variant="secondary" className="text-[10px]">Archived</Badge>
            )}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    disabled={isPending}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${orgSlug}/projects/${project.id}/settings`}>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchive}>
                    {isArchived ? (
                      <><ArchiveRestore className="h-4 w-4 mr-2" />Unarchive</>
                    ) : (
                      <><Archive className="h-4 w-4 mr-2" />Archive</>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TestTube className="h-3.5 w-3.5" />
            {project._count.testCases} cases
          </span>
          <span className="flex items-center gap-1">
            <Play className="h-3.5 w-3.5" />
            {project._count.testRuns} runs
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {project._count.members}
          </span>
        </div>
      </div>
    </div>
  );
}
