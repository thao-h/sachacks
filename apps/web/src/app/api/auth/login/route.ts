import { z } from "zod";
import { handleRoute, ok } from "@/server/contracts/api";
import { setSessionUser, type SessionUser } from "@/lib/session";

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone or email required"),
  name: z.string().optional(),
});

export const POST = handleRoute(async (request) => {
  const body = await request.json();
  const { identifier, name } = loginSchema.parse(body);

  const isEmail = identifier.includes("@");

  const user: SessionUser = {
    id: `usr_${Date.now().toString(36)}`,
    name: name || identifier.split("@")[0],
    ...(isEmail ? { email: identifier } : { phone: identifier }),
    canOrder: true,
    canDrive: true,
    restaurantIds: [],
    isAdmin: false,
    mode: "order",
  };

  await setSessionUser(user);
  return ok(user);
});
