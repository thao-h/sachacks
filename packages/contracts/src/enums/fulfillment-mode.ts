export const FulfillmentMode = {
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
} as const;

export type FulfillmentMode = (typeof FulfillmentMode)[keyof typeof FulfillmentMode];
