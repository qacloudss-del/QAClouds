import { z } from "zod";

export const UpdateOrgSchema = z.object({
  name: z.string().min(2).max(64),
  timezone: z.string().min(1),
});

const ASSIGNABLE_ROLES = ["ADMIN", "QA_MANAGER", "TESTER", "DEVELOPER", "VIEWER"] as const;

export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type UpdateOrgInput = z.infer<typeof UpdateOrgSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
