import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(256).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1"),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(256).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const AddProjectMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "QA_MANAGER", "TESTER", "DEVELOPER", "VIEWER"]),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof AddProjectMemberSchema>;
