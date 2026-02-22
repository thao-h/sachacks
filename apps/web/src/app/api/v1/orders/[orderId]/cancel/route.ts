import { orderService } from "@/server/modules/orders/service";
import { cancelOrderSchema } from "@/server/modules/dispatch/schemas";
import { ok, handleRoute } from "@/server/contracts/api";

export const POST = handleRoute(async (request, { params }) => {
  const { orderId } = await params;
  const body = await request.json();
  const { reason } = cancelOrderSchema.parse(body);
  const order = await orderService.cancelOrder(orderId, reason);
  return ok(order);
});
