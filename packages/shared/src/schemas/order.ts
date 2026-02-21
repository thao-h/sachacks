import { z } from "zod";
import { OrderStatus } from "../enums/order-status";

export const createOrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(createOrderItemSchema).min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  deliveryAddress: z.string().min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
