import { z } from "zod";

export const CreateOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(64, "Organization name must be under 64 characters"),
});

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(64, "Project name must be under 64 characters"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1"),
});

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
