import { prisma } from "@/server/db";
import type { OrderStatus } from "@ddba/shared";

export const orderRepo = {
  async create(data: {
    restaurantId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    subtotalCents: number;
    items: {
      menuItemId: string;
      name: string;
      unitPriceCents: number;
      quantity: number;
      lineTotalCents: number;
    }[];
  }) {
    return prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        subtotalCents: data.subtotalCents,
        items: { create: data.items },
      },
      include: { items: true },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, dispatch: true },
    });
  },

  async findByRestaurant(restaurantId: string) {
    return prisma.order.findMany({
      where: { restaurantId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByStatus(status: OrderStatus) {
    return prisma.order.findMany({
      where: { status },
      include: { items: true, restaurant: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  },
};
