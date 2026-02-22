import { prisma } from "../client";

export const menusPrismaRepo = {
  async findAll() {
    return prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } });
  },
};
