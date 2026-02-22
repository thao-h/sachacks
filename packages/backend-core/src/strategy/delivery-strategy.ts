import type { DeliveryStatus } from "@ddba/contracts";

// TODO: Implement delivery strategy selector
// Strategies: route_match, community_batch, guaranteed_courier

export type DeliveryStrategyType = "route_match" | "community_batch" | "guaranteed_courier";

export interface DeliveryStrategyResult {
  strategy: DeliveryStrategyType;
  estimatedMinutes: number;
  driverId?: string;
  communityGroupId?: string;
}

export function selectDeliveryStrategy(
  _orderId: string,
  _restaurantZip: string,
  _deliveryZip: string,
): DeliveryStrategyResult {
  // TODO: implement strategy selection based on:
  // 1. Check route-posts for route_match
  // 2. Check community-groups for community_batch
  // 3. Fall back to guaranteed_courier
  return {
    strategy: "guaranteed_courier",
    estimatedMinutes: 45,
  };
}
