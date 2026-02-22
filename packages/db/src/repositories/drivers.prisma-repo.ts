import { prisma } from "../client";

export const driversPrismaRepo = {
  async findAll() {
    return prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  },
};
