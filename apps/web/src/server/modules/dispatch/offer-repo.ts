import { prisma } from "@/server/db";
import type { OfferStatus } from "@ddba/shared";

/** Default offer TTL in minutes */
const OFFER_TTL_MINUTES = 5;

export const offerRepo = {
  async createMany(orderId: string, driverIds: string[]) {
    const expiresAt = new Date(Date.now() + OFFER_TTL_MINUTES * 60_000);
    const data = driverIds.map((driverId) => ({
      orderId,
      driverId,
      status: "OFFERED" as const,
      expiresAt,
    }));
    await prisma.dispatchOffer.createMany({ data });
    return prisma.dispatchOffer.findMany({
      where: { orderId, status: "OFFERED" },
      include: { driver: true },
    });
  },

  async findById(id: string) {
    return prisma.dispatchOffer.findUnique({
      where: { id },
      include: { order: true, driver: true },
    });
  },

  async findActiveByOrder(orderId: string) {
    return prisma.dispatchOffer.findMany({
      where: { orderId, status: "OFFERED" },
      include: { driver: true },
    });
  },

  async findActiveByDriver(driverId: string) {
    return prisma.dispatchOffer.findMany({
      where: {
        driverId,
        status: "OFFERED",
        expiresAt: { gt: new Date() },
      },
      include: { order: { include: { restaurant: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Atomically accept an offer: set this offer to ACCEPTED and all other
   * OFFERED offers for the same order to EXPIRED. Uses a transaction to
   * guarantee first-accept-wins semantics.
   */
  async acceptOffer(offerId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      // Attempt to claim — will fail if already non-OFFERED
      const accepted = await tx.dispatchOffer.update({
        where: { id: offerId, status: "OFFERED" },
        data: { status: "ACCEPTED" },
        include: { order: true, driver: true },
      });

      // Expire all other offers for this order
      await tx.dispatchOffer.updateMany({
        where: {
          orderId,
          id: { not: offerId },
          status: "OFFERED",
        },
        data: { status: "EXPIRED" },
      });

      return accepted;
    });
  },

  async expireByOrder(orderId: string) {
    return prisma.dispatchOffer.updateMany({
      where: { orderId, status: "OFFERED" },
      data: { status: "EXPIRED" },
    });
  },

  async rejectByOrder(orderId: string) {
    return prisma.dispatchOffer.updateMany({
      where: { orderId, status: "OFFERED" },
      data: { status: "REJECTED" },
    });
  },

  async updateStatus(id: string, status: OfferStatus) {
    return prisma.dispatchOffer.update({
      where: { id },
      data: { status },
    });
  },
};
