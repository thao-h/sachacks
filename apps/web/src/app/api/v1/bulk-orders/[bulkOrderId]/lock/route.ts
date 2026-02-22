import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import {
  ForbiddenError,
  InvalidStateError,
  NotFoundError,
} from "@/server/lib/errors";
import { isCommunityManager, requireSessionUser } from "@/server/modules/communities/utils";

export const POST = handleRoute(async (_request, { params }) => {
  const user = await requireSessionUser();
  const { bulkOrderId } = await params;

  const bulkOrder = await prisma.bulkOrder.findUnique({
    where: { id: bulkOrderId },
    include: {
      community: {
        select: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!bulkOrder) {
    throw new NotFoundError("BulkOrder", bulkOrderId);
  }

  const memberRole = bulkOrder.community.members[0]?.role ?? null;
  const canLock =
    bulkOrder.hostUserId === user.id || isCommunityManager(memberRole);

  if (!canLock) {
    throw new ForbiddenError("Only hosts or community admins can lock this order");
  }

  if (bulkOrder.status !== "OPEN") {
    throw new InvalidStateError(
      `Cannot lock bulk order from ${bulkOrder.status} state`,
    );
  }

  const updated = await prisma.bulkOrder.update({
    where: { id: bulkOrderId },
    data: { status: "LOCKED" },
    include: {
      _count: { select: { participants: true } },
    },
  });

  return ok({
    bulkOrder: {
      id: updated.id,
      status: updated.status,
      participantsCount: updated._count.participants,
      joined: true,
      isHost: updated.hostUserId === user.id,
      canLock,
    },
  });
});
