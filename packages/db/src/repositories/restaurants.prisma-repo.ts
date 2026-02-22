import { prisma } from "../client";

export const restaurantsPrismaRepo = {
  async findAll() {
    return prisma.restaurant.findMany({ orderBy: { createdAt: "desc" } });
  },
};
