import { dispatchService } from "@/server/modules/dispatch/service";
import { createAssignmentSchema } from "@/server/modules/dispatch/schemas";
import { ok, handleRoute } from "@/server/contracts/api";

export const POST = handleRoute(async (request) => {
  const body = await request.json();
  const input = createAssignmentSchema.parse(body);
  const assignment = await dispatchService.assignDriver(input);
  return ok(assignment, 201);
});
