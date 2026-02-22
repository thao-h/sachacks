export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELED]: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}
