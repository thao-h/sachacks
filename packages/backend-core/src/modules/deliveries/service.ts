import type { DeliveryRepo } from "./repo";
import type { DeliveryStatus } from "@ddba/contracts";

export function createDeliveryService(repo: DeliveryRepo) {
  return {
    async assignDriver(orderId: string, driverId: string) {
      // TODO: validate order status, check driver availability, create delivery
      throw new Error("TODO: implement assignDriver");
    },
    async updateStatus(deliveryId: string, newStatus: DeliveryStatus) {
      // TODO: validate transition, update, sync order status
      throw new Error("TODO: implement updateStatus");
    },
    async getByOrder(orderId: string) {
      return repo.findByOrder(orderId);
    },
  };
}
