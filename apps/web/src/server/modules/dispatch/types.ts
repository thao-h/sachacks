import type { DispatchStatus } from "@ddba/shared";

// TODO: Add dispatch DTOs
export type AssignmentSummary = {
  id: string;
  orderId: string;
  driverId: string;
  status: DispatchStatus;
  createdAt: Date;
};
