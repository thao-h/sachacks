import { z } from "zod";

export const createOrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(createOrderItemSchema).min(1),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().min(1).max(30),
  deliveryAddress: z.string().min(1).max(500),
  // TODO: add delivery notes, scheduled time, coupon code, tip amount
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
