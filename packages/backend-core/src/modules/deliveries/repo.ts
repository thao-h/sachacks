import type { Delivery, DeliveryWithDetails } from "./types";
import type { DeliveryStatus } from "@ddba/contracts";

export interface DeliveryRepo {
  create(orderId: string, driverId: string): Promise<Delivery>;
  findById(id: string): Promise<DeliveryWithDetails | null>;
  findByOrder(orderId: string): Promise<Delivery | null>;
  findByDriver(driverId: string): Promise<Delivery[]>;
  findByStatus(status: DeliveryStatus): Promise<Delivery[]>;
  updateStatus(id: string, status: DeliveryStatus): Promise<Delivery>;
}
