import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async () => {
  return ok({ status: "ok", timestamp: new Date().toISOString() });
});
