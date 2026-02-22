export const DeliveryStrategy = {
  ROUTE_MATCH: "ROUTE_MATCH",
  COMMUNITY_BATCH: "COMMUNITY_BATCH",
  GUARANTEED_COURIER: "GUARANTEED_COURIER",
} as const;

export type DeliveryStrategy = (typeof DeliveryStrategy)[keyof typeof DeliveryStrategy];
