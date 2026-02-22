import { handleRoute, ok } from "@/server/contracts/api";
import { getSessionUser } from "@/lib/session";
import { UnauthorizedError } from "@/server/lib/errors";

export const GET = handleRoute(async () => {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return ok(user);
});
