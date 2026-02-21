import type { OrderStatus } from "@ddba/shared";

// TODO: Add full order response DTOs
export type OrderSummary = {
  id: string;
  restaurantId: string;
  status: OrderStatus;
  customerName: string;
  subtotalCents: number;
  createdAt: Date;
};
