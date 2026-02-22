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

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const stableId = Buffer.from(normalizedIdentifier)
    .toString("base64url")
    .slice(0, 24);
  const isEmail = identifier.includes("@");

  const user: SessionUser = {
    id: `usr_${stableId}`,
    name: name || identifier.split("@")[0],
    ...(isEmail ? { email: identifier } : { phone: identifier }),
    canOrder: true,
    canDrive: true,
    restaurantIds: [],
    isAdmin: false,
    mode: "order",
    areaPreference: null,
  };

  await setSessionUser(user);
  return ok(user);
});
