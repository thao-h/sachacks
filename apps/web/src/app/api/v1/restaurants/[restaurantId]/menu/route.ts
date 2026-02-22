import { menuService } from "@/server/modules/menu/service";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async (_request, { params }) => {
  const { restaurantId } = await params;
  const items = await menuService.getMenuForRestaurant(restaurantId);
  return ok(items);
});
