// TODO: Implement session management (mock auth for MVP)

export type UserRole = "customer" | "restaurant" | "dispatcher";

export type Session = {
  userId: string;
  role: UserRole;
};

export async function getSession(): Promise<Session | null> {
  // TODO: Replace with real auth
  // For MVP, return a mock session based on route or header
  return null;
}

export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (role && session.role !== role) {
    throw new Error("Forbidden");
  }
  return session;
}
