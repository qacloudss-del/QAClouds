"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateMemberRole, removeMember } from "../actions/org-actions";
import type { OrgRole } from "@prisma/client";

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  QA_MANAGER: "QA Manager",
  TESTER: "Tester",
  DEVELOPER: "Developer",
  VIEWER: "Viewer",
};

const ASSIGNABLE_ROLES: OrgRole[] = ["ADMIN", "QA_MANAGER", "TESTER", "DEVELOPER", "VIEWER"];

interface Member {
  id: string;
  role: OrgRole;
  status: string;
  invitedEmail: string | null;
  user: { id: string; name: string; email: string; avatarUrl: string | null } | null;
}

interface Props {
  orgId: string;
  members: Member[];
  currentUserId: string;
}

export function MembersTable({ orgId, members, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(targetUserId: string, newRole: OrgRole) {
    startTransition(async () => {
      await updateMemberRole(orgId, targetUserId, newRole);
      router.refresh();
    });
  }

  function handleRemove(targetUserId: string) {
    startTransition(async () => {
      await removeMember(orgId, targetUserId);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border divide-y">
      {members.map((member) => {
        const name = member.user?.name ?? member.invitedEmail ?? "Unknown";
        const email = member.user?.email ?? member.invitedEmail ?? "";
        const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
        const isSelf = member.user?.id === currentUserId;
        const isOwner = member.role === "OWNER";
        const isPending_ = member.status === "PENDING";

        return (
          <div key={member.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={member.user?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{name}</span>
                {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                {isPending_ && (
                  <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">{email}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOwner || isPending_ ? (
                <span className="text-sm text-muted-foreground w-32 text-right">
                  {ROLE_LABELS[member.role]}
                </span>
              ) : (
                <Select
                  defaultValue={member.role}
                  onValueChange={(v) =>
                    member.user && handleRoleChange(member.user.id, v as OrgRole)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="text-xs">
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {!isOwner && member.user && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-destructive">
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        They will lose access to this organization and all its projects immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => member.user && handleRemove(member.user.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
