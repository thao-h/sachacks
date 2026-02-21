import { prisma } from "@/server/db";

export const menuRepo = {
  async findByRestaurant(restaurantId: string) {
    return prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      orderBy: { category: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.menuItem.findUnique({ where: { id } });
  },

  async findByIds(ids: string[]) {
    return prisma.menuItem.findMany({ where: { id: { in: ids } } });
  },
};
