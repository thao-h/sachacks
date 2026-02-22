import { z } from "zod";
import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import { ForbiddenError, ValidationError } from "@/server/lib/errors";
import {
  generateInviteCode,
  getCommunityMembershipOrThrow,
  isCommunityManager,
  requireSessionUser,
} from "@/server/modules/communities/utils";

const inviteSchema = z.object({
  expiresAt: z.string().datetime().optional(),
});

async function createInviteWithRetry(
  tx: any,
  communityId: string,
  createdByUserId: string,
  expiresAt: Date | null,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await tx.communityInvite.create({
        data: {
          communityId,
          createdByUserId,
          code: generateInviteCode(),
          isActive: true,
          expiresAt,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new ValidationError("Failed to generate a unique invite code");
}

export const POST = handleRoute(async (request, { params }) => {
  const user = await requireSessionUser();
  const { communityId } = await params;
  const body = await request.json();
  const { expiresAt } = inviteSchema.parse(body);

  const membership = await getCommunityMembershipOrThrow(communityId, user.id);
  if (!isCommunityManager(membership.role)) {
    throw new ForbiddenError("Only owners/admins can issue invites");
  }

  const parsedExpiry = expiresAt ? new Date(expiresAt) : null;
  if (parsedExpiry && Number.isNaN(parsedExpiry.getTime())) {
    throw new ValidationError("Invalid invite expiration timestamp");
  }

  const invite = await prisma.$transaction(async (tx) => {
    await tx.communityInvite.updateMany({
      where: { communityId, isActive: true },
      data: { isActive: false },
    });

    return createInviteWithRetry(tx, communityId, user.id, parsedExpiry);
  });

  return ok({
    inviteCode: invite.code,
    expiresAt: invite.expiresAt,
    createdAt: invite.createdAt,
  });
});
