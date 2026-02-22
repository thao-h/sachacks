import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  // TODO: add vehicle info, license, zones
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
