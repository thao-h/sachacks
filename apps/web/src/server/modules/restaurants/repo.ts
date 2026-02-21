import { prisma } from "@/server/db";

export const restaurantRepo = {
  async findBySlug(slug: string) {
    return prisma.restaurant.findUnique({
      where: { slug },
      include: { menuItems: { where: { isAvailable: true } } },
    });
  },

  async findById(id: string) {
    return prisma.restaurant.findUnique({ where: { id } });
  },

  async listActive() {
    return prisma.restaurant.findMany({ where: { isActive: true } });
  },
};
