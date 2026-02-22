import type { Order, OrderWithItems } from "./types";
import type { OrderStatus } from "@ddba/contracts";

export interface OrderRepo {
  create(data: {
    restaurantId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    subtotalCents: number;
    items: Array<{
      menuItemId: string;
      name: string;
      unitPriceCents: number;
      quantity: number;
      lineTotalCents: number;
    }>;
  }): Promise<OrderWithItems>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByRestaurant(restaurantId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
