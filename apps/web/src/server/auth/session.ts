import { getSessionUser } from "@/lib/session";
import { UnauthorizedError, ForbiddenError } from "@/server/lib/errors";

export type UserRole = "customer" | "restaurant" | "dispatcher";

export type Session = {
  userId: string;
  role: UserRole;
};

export async function getSession(): Promise<Session | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const roleMap: Record<string, UserRole> = {
    order: "customer",
    drive: "customer",
    restaurant: "restaurant",
    admin: "dispatcher",
  };

  return {
    userId: user.id,
    role: roleMap[user.mode] ?? "customer",
  };
}

export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  if (role && session.role !== role) throw new ForbiddenError();
  return session;
}
