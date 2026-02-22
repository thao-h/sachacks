import { z } from "zod";
import { ok, handleRoute } from "@/server/contracts/api";
import { DAVIS_AREAS } from "@/lib/davis-areas";
import { setSessionUser } from "@/lib/session";
import { requireSessionUser } from "@/server/modules/communities/utils";

const setAreaSchema = z.object({
  area: z.enum(DAVIS_AREAS).nullable(),
});

export const POST = handleRoute(async (request) => {
  const user = await requireSessionUser();
  const body = await request.json();
  const { area } = setAreaSchema.parse(body);

  const updated = { ...user, areaPreference: area };
  await setSessionUser(updated);

  return ok({
    user: updated,
  });
});
