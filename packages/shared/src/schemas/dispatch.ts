import { z } from "zod";

export const createAssignmentSchema = z.object({
  orderId: z.string().min(1),
  driverId: z.string().min(1),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
