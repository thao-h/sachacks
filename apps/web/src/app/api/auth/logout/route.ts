import { handleRoute, ok } from "@/server/contracts/api";
import { clearSession } from "@/lib/session";

export const POST = handleRoute(async () => {
  await clearSession();
  return ok({ success: true });
});
