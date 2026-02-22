export const DeliveryStatus = {
  UNASSIGNED: "UNASSIGNED",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  DROPPED_OFF: "DROPPED_OFF",
} as const;

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.UNASSIGNED]: [DeliveryStatus.ASSIGNED],
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.PICKED_UP],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.DROPPED_OFF],
  [DeliveryStatus.DROPPED_OFF]: [],
};

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from]?.includes(to) ?? false;
}
