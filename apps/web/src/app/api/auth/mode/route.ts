import { z } from "zod";
import { handleRoute, ok } from "@/server/contracts/api";
import { getSessionUser, setSessionUser, canUseMode } from "@/lib/session";
import { UnauthorizedError, ForbiddenError } from "@/server/lib/errors";

const modeSchema = z.object({
  mode: z.enum(["order", "drive", "restaurant", "admin"]),
});

export const POST = handleRoute(async (request) => {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();

  const body = await request.json();
  const { mode } = modeSchema.parse(body);

  if (!canUseMode(user, mode)) {
    throw new ForbiddenError(`You don't have access to ${mode} mode`);
  }

  const updated = { ...user, mode };
  await setSessionUser(updated);
  return ok(updated);
});
