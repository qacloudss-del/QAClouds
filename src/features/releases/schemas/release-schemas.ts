import { z } from "zod";

export const CreateReleaseSchema = z.object({
  name: z.string().min(1).max(64),
  version: z.string().max(32).optional(),
  description: z.string().max(512).optional(),
  targetDate: z.string().optional(),
});

export const UpdateReleaseStatusSchema = z.object({
  status: z.enum(["PLANNED", "IN_PROGRESS", "RELEASED", "CANCELLED"]),
});

export type CreateReleaseInput = z.infer<typeof CreateReleaseSchema>;
