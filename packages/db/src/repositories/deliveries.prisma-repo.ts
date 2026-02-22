import { prisma } from "../client";

export const deliveriesPrismaRepo = {
  async findAll() {
    return prisma.dispatchAssignment.findMany({
      orderBy: { createdAt: "desc" },
      include: { order: true, driver: true },
    });
  },
};
