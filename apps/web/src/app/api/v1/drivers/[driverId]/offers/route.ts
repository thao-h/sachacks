import { dispatchService } from "@/server/modules/dispatch/service";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async (_request, { params }) => {
  const { driverId } = await params;
  const offers = await dispatchService.getOffersForDriver(driverId);
  return ok(offers);
});
