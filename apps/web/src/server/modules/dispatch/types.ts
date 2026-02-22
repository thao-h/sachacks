import type { DispatchStatus, OfferStatus } from "@ddba/shared";

export type AssignmentSummary = {
  id: string;
  orderId: string;
  driverId: string;
  status: DispatchStatus;
  createdAt: Date;
};

export type OfferSummary = {
  id: string;
  orderId: string;
  driverId: string;
  status: OfferStatus;
  expiresAt: Date;
  createdAt: Date;
};
