import { dispatchRepo } from "./repo";
import { offerRepo } from "./offer-repo";
import { orderRepo } from "../orders/repo";
import { driverRepo } from "../drivers/repo";
import { NotFoundError, InvalidStateError } from "@/server/lib/errors";
import { canTransitionDispatch, DispatchStatus, OrderStatus, type CreateAssignmentInput } from "@ddba/shared";
import { logger } from "@/server/lib/logger";

/** How many drivers to offer simultaneously */
const MAX_OFFER_COUNT = 3;

export const dispatchService = {
  /**
   * Manual driver assignment (admin/fallback). Bypasses offer flow.
   */
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

    // Expire any open offers since we're manually assigning
    await offerRepo.expireByOrder(input.orderId);

    const assignment = await dispatchRepo.createAssignment(input.orderId, input.driverId);
    await orderRepo.updateStatus(input.orderId, OrderStatus.OUT_FOR_DELIVERY);

    logger.info("Driver manually assigned", { orderId: input.orderId, driverId: input.driverId });
    return assignment;
  },

  /**
   * Auto-dispatch: find eligible drivers and create offers.
   * Called when order transitions to READY_FOR_PICKUP.
   */
  async autoDispatch(orderId: string) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new InvalidStateError(
        `Order must be READY_FOR_PICKUP to auto-dispatch, currently: ${order.status}`,
      );
    }

    // Check for existing assignment or active offers
    const existingAssignment = await dispatchRepo.findByOrder(orderId);
    if (existingAssignment) {
      throw new InvalidStateError("Order already has a dispatch assignment");
    }

    const existingOffers = await offerRepo.findActiveByOrder(orderId);
    if (existingOffers.length > 0) {
      throw new InvalidStateError("Order already has active dispatch offers");
    }

    // Select eligible drivers
    // TODO: add geospatial filtering, fairness/earning balancing, capacity checks
    const activeDrivers = await driverRepo.findAll();
    const candidateIds = activeDrivers
      .slice(0, MAX_OFFER_COUNT)
      .map((d) => d.id);

    if (candidateIds.length === 0) {
      logger.warn("No eligible drivers for auto-dispatch", { orderId });
      return [];
    }

    const offers = await offerRepo.createMany(orderId, candidateIds);
    logger.info("Auto-dispatch offers created", {
      orderId,
      offerCount: String(offers.length),
      driverIds: candidateIds.join(","),
    });

    return offers;
  },

  /**
   * Driver accepts an offer. First-accept-wins via atomic transaction.
   * Creates DispatchAssignment and moves order to OUT_FOR_DELIVERY.
   */
  async acceptOffer(offerId: string) {
    const offer = await offerRepo.findById(offerId);
    if (!offer) throw new NotFoundError("DispatchOffer", offerId);

    if (offer.status !== "OFFERED") {
      throw new InvalidStateError(
        `Offer is ${offer.status}, only OFFERED can be accepted`,
      );
    }

    if (offer.expiresAt < new Date()) {
      await offerRepo.updateStatus(offerId, "EXPIRED");
      throw new InvalidStateError("Offer has expired");
    }

    // Atomic accept (expires other offers in same transaction)
    const accepted = await offerRepo.acceptOffer(offerId, offer.orderId);

    // Create the dispatch assignment
    const assignment = await dispatchRepo.createAssignment(
      offer.orderId,
      offer.driverId,
    );

    // Move order to OUT_FOR_DELIVERY
    await orderRepo.updateStatus(offer.orderId, OrderStatus.OUT_FOR_DELIVERY);

    logger.info("Offer accepted, driver assigned", {
      offerId,
      orderId: offer.orderId,
      driverId: offer.driverId,
      assignmentId: assignment.id,
    });

    return { offer: accepted, assignment };
  },

  /** List active offers for a driver */
  async getOffersForDriver(driverId: string) {
    return offerRepo.findActiveByDriver(driverId);
  },

  /** Existing: get assignment by order */
  async getByOrder(orderId: string) {
    return dispatchRepo.findByOrder(orderId);
  },

  /**
   * Update dispatch assignment status (PICKED_UP, DROPPED_OFF).
   * On DROPPED_OFF, order status -> DELIVERED.
   */
  async updateStatus(assignmentId: string, newStatus: DispatchStatus) {
    const assignment = await dispatchRepo.findById(assignmentId);
    if (!assignment) throw new NotFoundError("DispatchAssignment", assignmentId);

    if (!canTransitionDispatch(assignment.status as DispatchStatus, newStatus)) {
      throw new InvalidStateError(
        `Cannot move dispatch from ${assignment.status} to ${newStatus}`,
      );
    }

    const updated = await dispatchRepo.updateStatus(assignmentId, newStatus);

    if (newStatus === DispatchStatus.DROPPED_OFF) {
      await orderRepo.updateStatus(assignment.orderId, OrderStatus.DELIVERED);
    }

    logger.info("Dispatch status updated", {
      assignmentId,
      from: assignment.status,
      to: newStatus,
    });

    return updated;
  },

  /**
   * Cancel dispatch: expire offers and void assignment if not yet picked up.
   * Called by order cancellation flow.
   */
  async cancelForOrder(orderId: string) {
    // Expire any open offers
    await offerRepo.rejectByOrder(orderId);

    // Void assignment if exists and not yet picked up
    const assignment = await dispatchRepo.findByOrder(orderId);
    if (assignment) {
      const status = assignment.status as DispatchStatus;
      if (status === DispatchStatus.PICKED_UP || status === DispatchStatus.DROPPED_OFF) {
        throw new InvalidStateError(
          "Cannot cancel order after driver has picked up",
        );
      }
      await dispatchRepo.updateStatus(assignment.id, DispatchStatus.UNASSIGNED);
    }

    logger.info("Dispatch cancelled for order", { orderId });
  },
};
