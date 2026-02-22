import { prisma } from "../client";

export const ordersPrismaRepo = {
  async findAll() {
    return prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  },
};
