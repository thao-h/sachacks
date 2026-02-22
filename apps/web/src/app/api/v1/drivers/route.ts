import { driverService } from "@/server/modules/drivers/service";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async () => {
  const drivers = await driverService.listActive();
  return ok(drivers);
});
