import { z } from "zod";
import { DispatchStatus } from "../enums/dispatch-status";

// ---------------------------------------------------------------------------
// Create assignment
// ---------------------------------------------------------------------------
export const createAssignmentSchema = z.object({
  orderId: z.string().min(1),
  driverId: z.string().min(1),
  // TODO: add pickup notes, priority level
});

// ---------------------------------------------------------------------------
// Update dispatch status
// ---------------------------------------------------------------------------
export const updateDispatchStatusSchema = z.object({
  status: z.nativeEnum(DispatchStatus),
  // TODO: add location coordinates, delivery proof
});

// ---------------------------------------------------------------------------
// Cancel order (restaurant-initiated)
// ---------------------------------------------------------------------------
export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateDispatchStatusInput = z.infer<typeof updateDispatchStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
