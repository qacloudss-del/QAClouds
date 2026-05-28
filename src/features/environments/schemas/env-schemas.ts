import { z } from "zod";

export const CreateEnvironmentSchema = z.object({
  name: z.string().min(1).max(48),
  description: z.string().max(256).optional(),
  color: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type CreateEnvironmentInput = z.infer<typeof CreateEnvironmentSchema>;
