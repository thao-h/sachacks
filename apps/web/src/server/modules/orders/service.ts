import { orderRepo } from "./repo";
import { menuRepo } from "../menu/repo";
import { dispatchService } from "../dispatch/service";
import { NotFoundError, InvalidStateError, ValidationError } from "@/server/lib/errors";
import { canTransitionOrder, multiplyCents, sumCents, OrderStatus, type CreateOrderInput, type OrderStatus as OrderStatusType } from "@ddba/shared";
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
        lineTotalCents: multiplyCents(menuItem.priceCents, item.quantity),
      };
    });

    const subtotalCents = sumCents(orderItems.map((i) => i.lineTotalCents));

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

  async updateStatus(orderId: string, newStatus: OrderStatusType) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    if (!canTransitionOrder(order.status as OrderStatusType, newStatus)) {
      throw new InvalidStateError(
        `Cannot move order from ${order.status} to ${newStatus}`,
      );
    }

    const updated = await orderRepo.updateStatus(orderId, newStatus);
    logger.info("Order status updated", { orderId, from: order.status, to: newStatus });

    // Auto-dispatch trigger: when order becomes READY_FOR_PICKUP, create offers
    if (newStatus === OrderStatus.READY_FOR_PICKUP) {
      try {
        await dispatchService.autoDispatch(orderId);
      } catch (err) {
        // Log but don't fail the status update — offers can be retried
        logger.error("Auto-dispatch failed", {
          orderId,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    return updated;
  },

  /**
   * Restaurant cancels an order. Allowed before driver picks up.
   * Cancels any dispatch offers/assignments, then sets order CANCELED.
   */
  async cancelOrder(orderId: string, reason?: string) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    const status = order.status as OrderStatusType;

    // Can't cancel if already delivered or already canceled
    if (status === OrderStatus.DELIVERED || status === OrderStatus.CANCELED) {
      throw new InvalidStateError(`Cannot cancel order in ${status} status`);
    }

    // If dispatched, verify driver hasn't picked up yet
    if (
      status === OrderStatus.OUT_FOR_DELIVERY ||
      status === OrderStatus.READY_FOR_PICKUP
    ) {
      await dispatchService.cancelForOrder(orderId);
    }

    const updated = await orderRepo.updateStatus(orderId, OrderStatus.CANCELED);
    logger.info("Order cancelled", { orderId, reason: reason ?? "none" });
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

  async listByStatus(status: OrderStatusType) {
    return orderRepo.findByStatus(status);
  },
};
