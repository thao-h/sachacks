import { z } from "zod";

// TODO: Add create/update driver schemas
export const createDriverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
