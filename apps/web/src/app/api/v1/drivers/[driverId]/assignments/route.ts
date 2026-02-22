import { dispatchRepo } from "@/server/modules/dispatch/repo";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async (_request, { params }) => {
  const { driverId } = await params;
  const assignments = await dispatchRepo.findByDriver(driverId);
  // Only return active assignments (ASSIGNED or PICKED_UP)
  const active = assignments.filter(
    (a) => a.status === "ASSIGNED" || a.status === "PICKED_UP",
  );
  return ok(active);
});
