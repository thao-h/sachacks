import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserMode = "order" | "drive" | "restaurant" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  canOrder: boolean;
  canDrive: boolean;
  restaurantIds: string[];
  isAdmin?: boolean;
  mode: UserMode;
  areaPreference?: string | null;
};

// ---------------------------------------------------------------------------
// Cookie helpers (server-side only — used in API route handlers)
// ---------------------------------------------------------------------------

const COOKIE_NAME = "ddba_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

// ---------------------------------------------------------------------------
// Mode validation
// ---------------------------------------------------------------------------

export function canUseMode(user: SessionUser, mode: UserMode): boolean {
  switch (mode) {
    case "order":
      return user.canOrder;
    case "drive":
      return user.canDrive;
    case "restaurant":
      return user.restaurantIds.length > 0;
    case "admin":
      return user.isAdmin === true;
    default:
      return false;
  }
}
