import { db } from "@/lib/db";
import type { OrgRole } from "@prisma/client";

export type Permission =
  | "can_manage_org_settings"
  | "can_manage_billing"
  | "can_manage_members"
  | "can_manage_projects"
  | "can_edit_test_cases"
  | "can_delete_test_cases"
  | "can_manage_test_runs"
  | "can_log_results"
  | "can_create_defects"
  | "can_manage_integrations"
  | "can_view_reports"
  | "can_manage_audit_logs"
  | "can_manage_api_keys";

const PERMISSIONS: Record<OrgRole, Permission[]> = {
  OWNER: [
    "can_manage_org_settings",
    "can_manage_billing",
    "can_manage_members",
    "can_manage_projects",
    "can_edit_test_cases",
    "can_delete_test_cases",
    "can_manage_test_runs",
    "can_log_results",
    "can_create_defects",
    "can_manage_integrations",
    "can_view_reports",
    "can_manage_audit_logs",
    "can_manage_api_keys",
  ],
  ADMIN: [
    "can_manage_org_settings",
    "can_manage_members",
    "can_manage_projects",
    "can_edit_test_cases",
    "can_delete_test_cases",
    "can_manage_test_runs",
    "can_log_results",
    "can_create_defects",
    "can_manage_integrations",
    "can_view_reports",
    "can_manage_audit_logs",
    "can_manage_api_keys",
  ],
  QA_MANAGER: [
    "can_manage_projects",
    "can_edit_test_cases",
    "can_delete_test_cases",
    "can_manage_test_runs",
    "can_log_results",
    "can_create_defects",
    "can_manage_integrations",
    "can_view_reports",
  ],
  TESTER: [
    "can_edit_test_cases",
    "can_manage_test_runs",
    "can_log_results",
    "can_create_defects",
    "can_view_reports",
  ],
  DEVELOPER: [
    "can_create_defects",
    "can_view_reports",
  ],
  VIEWER: [
    "can_view_reports",
  ],
};

export async function checkPermission(
  userId: string,
  orgId: string,
  action: Permission,
  projectId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check project-level role first (takes precedence)
  if (projectId) {
    const projectMember = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (projectMember) {
      const allowed = PERMISSIONS[projectMember.role]?.includes(action) ?? false;
      if (allowed) return { allowed: true };
    }
  }

  // Fall back to org-level role
  const member = await db.organizationMember.findFirst({
    where: { userId, organizationId: orgId, status: "ACTIVE" },
  });

  if (!member) {
    return { allowed: false, reason: "Not a member of this organization" };
  }

  const allowed = PERMISSIONS[member.role]?.includes(action) ?? false;
  return allowed
    ? { allowed: true }
    : { allowed: false, reason: "Insufficient permissions" };
}

export async function requirePermission(
  userId: string,
  orgId: string,
  action: Permission,
  projectId?: string
): Promise<void> {
  const { allowed, reason } = await checkPermission(userId, orgId, action, projectId);
  if (!allowed) throw new Error(reason ?? "Forbidden");
}
