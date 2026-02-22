export const OfferStatus = {
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED",
} as const;

export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];
