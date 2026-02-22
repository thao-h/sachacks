import type { DeliveryStatus } from "@ddba/contracts";

export type Delivery = {
  id: string;
  orderId: string;
  driverId: string;
  status: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type DeliveryWithDetails = Delivery & {
  driverName?: string;
  orderAddress?: string;
};
