import { dispatchRepo } from "./repo";
import { orderRepo } from "../orders/repo";
import { NotFoundError, InvalidStateError } from "@/server/lib/errors";
import { canTransitionDispatch, type CreateAssignmentInput, OrderStatus } from "@ddba/shared";
import { logger } from "@/server/lib/logger";

export const dispatchService = {
  async assignDriver(input: CreateAssignmentInput) {
    const order = await orderRepo.findById(input.orderId);
    if (!order) throw new NotFoundError("Order", input.orderId);

    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new InvalidStateError(
        `Order must be READY_FOR_PICKUP to assign a driver, currently: ${order.status}`,
      );
    }

    const existing = await dispatchRepo.findByOrder(input.orderId);
    if (existing) {
      throw new InvalidStateError("Order already has a dispatch assignment");
    }

    const assignment = await dispatchRepo.createAssignment(input.orderId, input.driverId);
    await orderRepo.updateStatus(input.orderId, OrderStatus.OUT_FOR_DELIVERY);

    logger.info("Driver assigned", { orderId: input.orderId, driverId: input.driverId });
    return assignment;
  },

  async getByOrder(orderId: string) {
    return dispatchRepo.findByOrder(orderId);
  },

  async updateStatus(assignmentId: string, newStatus: "PICKED_UP" | "DROPPED_OFF") {
    // TODO: Implement dispatch status transitions
    throw new Error("TODO: implement updateStatus");
  },
};
