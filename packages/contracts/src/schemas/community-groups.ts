import { z } from "zod";

export const createCommunityGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  zipCodes: z.array(z.string().min(1)).min(1),
  // TODO: add member limits, delivery windows
});

export type CreateCommunityGroupInput = z.infer<typeof createCommunityGroupSchema>;
