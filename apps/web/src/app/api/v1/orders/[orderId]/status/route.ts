import { orderService } from "@/server/modules/orders/service";
import { updateOrderStatusSchema } from "@/server/modules/orders/schemas";
import { ok, handleRoute } from "@/server/contracts/api";

export const POST = handleRoute(async (request, { params }) => {
  const { orderId } = await params;
  const body = await request.json();
  const { status } = updateOrderStatusSchema.parse(body);
  const order = await orderService.updateStatus(orderId, status);
  return ok(order);
});
