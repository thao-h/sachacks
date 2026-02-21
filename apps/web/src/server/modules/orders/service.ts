import { orderRepo } from "./repo";
import { menuRepo } from "../menu/repo";
import { NotFoundError, InvalidStateError, ValidationError } from "@/server/lib/errors";
import { canTransitionOrder, type CreateOrderInput, type OrderStatus } from "@ddba/shared";
import { logger } from "@/server/lib/logger";

export const orderService = {
  async createOrder(input: CreateOrderInput) {
    const menuItems = await menuRepo.findByIds(input.items.map((i) => i.menuItemId));

    if (menuItems.length !== input.items.length) {
      throw new ValidationError("One or more menu items not found");
    }

    const orderItems = input.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPriceCents: menuItem.priceCents,
        quantity: item.quantity,
        lineTotalCents: menuItem.priceCents * item.quantity,
      };
    });

    const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

    const order = await orderRepo.create({
      restaurantId: input.restaurantId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      subtotalCents,
      items: orderItems,
    });

    logger.info("Order created", { orderId: order.id, subtotalCents });
    return order;
  },

  async updateStatus(orderId: string, newStatus: OrderStatus) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    if (!canTransitionOrder(order.status as OrderStatus, newStatus)) {
      throw new InvalidStateError(
        `Cannot move order from ${order.status} to ${newStatus}`,
      );
    }

    const updated = await orderRepo.updateStatus(orderId, newStatus);
    logger.info("Order status updated", { orderId, from: order.status, to: newStatus });
    return updated;
  },

  async getById(orderId: string) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);
    return order;
  },

  async listByRestaurant(restaurantId: string) {
    return orderRepo.findByRestaurant(restaurantId);
  },

  async listByStatus(status: OrderStatus) {
    return orderRepo.findByStatus(status);
  },
};
