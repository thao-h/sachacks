import { z } from "zod";
import { OrderStatus } from "../enums/order-status";

// ---------------------------------------------------------------------------
// Order item (nested in create-order payload)
// ---------------------------------------------------------------------------
export const createOrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
  // TODO: add special instructions, modifiers when product decisions are finalized
});

// ---------------------------------------------------------------------------
// Create order
// ---------------------------------------------------------------------------
export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(createOrderItemSchema).min(1),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().min(1).max(30),
  deliveryAddress: z.string().min(1).max(500),
  // TODO: add delivery notes, scheduled time, coupon code, tip amount
});

// ---------------------------------------------------------------------------
// Update order status
// ---------------------------------------------------------------------------
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  // TODO: add optional cancellation reason, notes
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
