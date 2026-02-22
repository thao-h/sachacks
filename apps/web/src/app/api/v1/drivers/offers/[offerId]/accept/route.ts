import { dispatchService } from "@/server/modules/dispatch/service";
import { ok, handleRoute } from "@/server/contracts/api";

export const POST = handleRoute(async (_request, { params }) => {
  const { offerId } = await params;
  const result = await dispatchService.acceptOffer(offerId);
  return ok(result);
});
