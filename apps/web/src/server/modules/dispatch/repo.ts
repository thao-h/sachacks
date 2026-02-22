import { prisma } from "@/server/db";
import type { DispatchStatus } from "@ddba/shared";

export const dispatchRepo = {
  async createAssignment(orderId: string, driverId: string) {
    return prisma.dispatchAssignment.create({
      data: { orderId, driverId, status: "ASSIGNED" },
      include: { order: true, driver: true },
    });
  },

  async findById(id: string) {
    return prisma.dispatchAssignment.findUnique({
      where: { id },
      include: { order: true, driver: true },
    });
  },

  async findByOrder(orderId: string) {
    return prisma.dispatchAssignment.findUnique({
      where: { orderId },
      include: { driver: true },
    });
  },

  async findByDriver(driverId: string) {
    return prisma.dispatchAssignment.findMany({
      where: { driverId },
      include: { order: { include: { restaurant: true, items: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByStatus(status: DispatchStatus) {
    return prisma.dispatchAssignment.findMany({
      where: { status },
      include: { order: { include: { restaurant: true } }, driver: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async updateStatus(id: string, status: DispatchStatus) {
    return prisma.dispatchAssignment.update({
      where: { id },
      data: { status },
      include: { order: true, driver: true },
    });
  },
};
