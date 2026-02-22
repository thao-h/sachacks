import type { OrderRepo } from "./repo";
import type { OrderStatus } from "@ddba/contracts";

export function createOrderService(repo: OrderRepo) {
  return {
    async createOrder(input: {
      restaurantId: string;
      customerName: string;
      customerPhone: string;
      deliveryAddress: string;
      items: Array<{ menuItemId: string; quantity: number }>;
    }) {
      // TODO: validate items exist, calculate totals, create order
      throw new Error("TODO: implement createOrder");
    },
    async getById(orderId: string) {
      // TODO: implement
      return repo.findById(orderId);
    },
    async updateStatus(orderId: string, newStatus: OrderStatus) {
      // TODO: validate transition, update status
      throw new Error("TODO: implement updateStatus");
    },
    async listByRestaurant(restaurantId: string) {
      return repo.findByRestaurant(restaurantId);
    },
    async listByStatus(status: OrderStatus) {
      return repo.findByStatus(status);
    },
  };
}
