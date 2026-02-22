import { z } from "zod";
import { DeliveryStatus } from "../enums/delivery-status";

export const createDeliverySchema = z.object({
  orderId: z.string().min(1),
  driverId: z.string().min(1),
  // TODO: add pickup notes, priority level
});

export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
  // TODO: add location coordinates, delivery proof
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>;
