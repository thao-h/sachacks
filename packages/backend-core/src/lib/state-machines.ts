import { ORDER_TRANSITIONS, DELIVERY_TRANSITIONS, type OrderStatus, type DeliveryStatus } from "@ddba/contracts";

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from]?.includes(to) ?? false;
}
