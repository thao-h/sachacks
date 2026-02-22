import { orderService } from "@/server/modules/orders/service";
import { createOrderSchema } from "@/server/modules/orders/schemas";
import { ValidationError } from "@/server/lib/errors";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) {
    throw new ValidationError("restaurantId query parameter is required");
  }
  const orders = await orderService.listByRestaurant(restaurantId);
  return ok(orders);
});

export const POST = handleRoute(async (request) => {
  const body = await request.json();
  const input = createOrderSchema.parse(body);
  const order = await orderService.createOrder(input);
  return ok(order, 201);
});
