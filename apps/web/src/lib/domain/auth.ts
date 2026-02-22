import { api } from "@/lib/api-client";
import type { SessionUser } from "@/lib/session";

export async function fetchCurrentUser(): Promise<SessionUser | null> {
  try {
    return (await api.me()) as SessionUser;
  } catch {
    return null;
  }
}

export async function login(
  identifier: string,
  name?: string,
): Promise<SessionUser> {
  return (await api.login(identifier, name)) as SessionUser;
}

export async function logout(): Promise<void> {
  await api.logout();
}

export async function switchMode(mode: string): Promise<SessionUser> {
  return (await api.setMode(mode)) as SessionUser;
}
