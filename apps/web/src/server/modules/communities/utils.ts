import { randomBytes } from "crypto";
import { prisma } from "@/server/db";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/lib/errors";
import { getSessionUser } from "@/lib/session";

type CommunityRole = "OWNER" | "ADMIN" | "MEMBER";

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function isCommunityManager(role?: CommunityRole | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function getCommunityMembershipOrThrow(communityId: string, userId: string) {
  const membership = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });

  if (!membership) {
    throw new ForbiddenError("You must join this community first");
  }

  return membership;
}

export async function getCommunityOrThrow(communityId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) {
    throw new NotFoundError("Community", communityId);
  }
  return community;
}
