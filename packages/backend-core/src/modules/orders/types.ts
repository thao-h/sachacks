import type { OrderStatus } from "@ddba/contracts";

export type Order = {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  subtotalCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };
