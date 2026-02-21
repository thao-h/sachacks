import { prisma } from "@/server/db";

export const driverRepo = {
  async findAll() {
    return prisma.driver.findMany({ where: { isActive: true } });
  },

  async findById(id: string) {
    return prisma.driver.findUnique({ where: { id } });
  },
};
