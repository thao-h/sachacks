import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import {
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "@/server/lib/errors";
import {
  getCommunityMembershipOrThrow,
  isCommunityManager,
  requireSessionUser,
} from "@/server/modules/communities/utils";

export const POST = handleRoute(async (_request, { params }) => {
  const user = await requireSessionUser();
  const { bulkOrderId } = await params;

  const bulkOrder = await prisma.bulkOrder.findUnique({
    where: { id: bulkOrderId },
    include: {
      participants: {
        where: { userId: user.id },
        select: { id: true },
      },
      _count: {
        select: { participants: true },
      },
      community: {
        select: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!bulkOrder) {
    throw new NotFoundError("BulkOrder", bulkOrderId);
  }

  await getCommunityMembershipOrThrow(bulkOrder.communityId, user.id);

  if (bulkOrder.status !== "OPEN") {
    throw new InvalidStateError("Only OPEN bulk orders can be joined");
  }

  if (bulkOrder.participants.length > 0) {
    const role = bulkOrder.community.members[0]?.role ?? null;
    return ok({
      bulkOrder: {
        id: bulkOrder.id,
        status: bulkOrder.status,
        participantsCount: bulkOrder._count.participants,
        joined: true,
        isHost: bulkOrder.hostUserId === user.id,
        canLock:
          bulkOrder.hostUserId === user.id || isCommunityManager(role),
      },
    });
  }

  try {
    await prisma.bulkOrderParticipant.create({
      data: {
        bulkOrderId: bulkOrder.id,
        userId: user.id,
      },
    });
  } catch {
    throw new ValidationError("You already joined this bulk order");
  }

  const role = bulkOrder.community.members[0]?.role ?? null;
  return ok({
    bulkOrder: {
      id: bulkOrder.id,
      status: bulkOrder.status,
      participantsCount: bulkOrder._count.participants + 1,
      joined: true,
      isHost: bulkOrder.hostUserId === user.id,
      canLock: bulkOrder.hostUserId === user.id || isCommunityManager(role),
    },
  });
});
