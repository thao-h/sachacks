import { dispatchService } from "@/server/modules/dispatch/service";
import { updateDispatchStatusSchema } from "@/server/modules/dispatch/schemas";
import { ok, handleRoute } from "@/server/contracts/api";

export const POST = handleRoute(async (request, context) => {
  const { assignmentId } = await context.params;
  const body = await request.json();
  const { status } = updateDispatchStatusSchema.parse(body);
  const updated = await dispatchService.updateStatus(assignmentId, status);
  return ok(updated);
});
