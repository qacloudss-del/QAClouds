"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { addProjectMember, removeProjectMember } from "../actions/project-actions";
import { UserPlus, X } from "lucide-react";
import type { OrgRole } from "@prisma/client";

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Owner", ADMIN: "Admin", QA_MANAGER: "QA Manager",
  TESTER: "Tester", DEVELOPER: "Developer", VIEWER: "Viewer",
};

const ASSIGNABLE: OrgRole[] = ["ADMIN", "QA_MANAGER", "TESTER", "DEVELOPER", "VIEWER"];

interface ProjectMember { userId: string; role: OrgRole; user: { name: string; email: string; avatarUrl: string | null } }
interface OrgMember { userId: string; name: string; email: string; avatarUrl: string | null }

interface Props {
  projectId: string; orgId: string;
  projectMembers: ProjectMember[]; availableOrgMembers: OrgMember[];
  currentUserId: string;
}

export function ProjectMembersManager({ projectId, orgId, projectMembers, availableOrgMembers, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<OrgRole>("TESTER");

  function handleAdd() {
    if (!selectedUserId) return;
    startTransition(async () => {
      await addProjectMember(projectId, orgId, { userId: selectedUserId, role: selectedRole as "ADMIN" | "QA_MANAGER" | "TESTER" | "DEVELOPER" | "VIEWER" });
      setSelectedUserId("");
      router.refresh();
    });
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      await removeProjectMember(projectId, orgId, userId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Add member row */}
      {availableOrgMembers.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Add org member…" /></SelectTrigger>
              <SelectContent>
                {availableOrgMembers.map((m) => (
                  <SelectItem key={m.userId} value={m.userId} className="text-sm">{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as OrgRole)}>
            <SelectTrigger className="h-8 w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASSIGNABLE.map((r) => <SelectItem key={r} value={r} className="text-sm">{ROLE_LABELS[r]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={handleAdd} disabled={!selectedUserId || isPending}>
            <UserPlus className="h-3.5 w-3.5 mr-1" />Add
          </Button>
        </div>
      )}

      {/* Member list */}
      <div className="rounded-lg border divide-y">
        {projectMembers.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={m.user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{m.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{m.user.name}</span>
                {m.userId === currentUserId && <span className="text-xs text-muted-foreground">(you)</span>}
              </div>
              <span className="text-xs text-muted-foreground truncate">{m.user.email}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{ROLE_LABELS[m.role]}</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => handleRemove(m.userId)} disabled={isPending}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
