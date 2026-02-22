import { z } from "zod";
import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import { ValidationError } from "@/server/lib/errors";
import {
  getCommunityMembershipOrThrow,
  isCommunityManager,
  requireSessionUser,
} from "@/server/modules/communities/utils";

const createBulkOrderSchema = z.object({
  communityId: z.string().min(1),
  restaurantId: z.string().min(1),
  title: z.string().trim().min(2).max(100),
  orderDeadline: z.string().datetime(),
  deliveryNotes: z.string().trim().max(280).optional(),
});

const statusFilterSchema = z.enum([
  "OPEN",
  "LOCKED",
  "PLACED",
  "DELIVERED",
  "CANCELLED",
]);

export const GET = handleRoute(async (request) => {
  const user = await requireSessionUser();
  const { searchParams } = new URL(request.url);

  const communityId = searchParams.get("communityId");
  const statusRaw = searchParams.get("status");
  const status = statusRaw ? statusFilterSchema.parse(statusRaw) : undefined;

  const where: {
    community?: {
      members: {
        some: { userId: string };
      };
    };
    communityId?: string;
    status?: "OPEN" | "LOCKED" | "PLACED" | "DELIVERED" | "CANCELLED";
  } = {
    community: {
      members: {
        some: { userId: user.id },
      },
    },
  };

  if (communityId) {
    where.communityId = communityId;
  }

  if (status) {
    where.status = status;
  }

  const bulkOrders = await prisma.bulkOrder.findMany({
    where,
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true },
      },
      community: {
        select: {
          id: true,
          name: true,
          area: true,
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
      participants: {
        where: { userId: user.id },
        select: { id: true },
      },
      _count: {
        select: { participants: true },
      },
    },
    orderBy: [{ orderDeadline: "asc" }, { createdAt: "desc" }],
  });

  const data = bulkOrders.map((bulkOrder) => {
    const memberRole = bulkOrder.community.members[0]?.role ?? null;
    const isHost = bulkOrder.hostUserId === user.id;

    return {
      id: bulkOrder.id,
      communityId: bulkOrder.communityId,
      communityName: bulkOrder.community.name,
      communityArea: bulkOrder.community.area,
      restaurantId: bulkOrder.restaurantId,
      restaurantName: bulkOrder.restaurant.name,
      restaurantSlug: bulkOrder.restaurant.slug,
      title: bulkOrder.title,
      orderDeadline: bulkOrder.orderDeadline,
      deliveryNotes: bulkOrder.deliveryNotes,
      status: bulkOrder.status,
      participantsCount: bulkOrder._count.participants,
      joined: bulkOrder.participants.length > 0,
      isHost,
      canLock: isHost || isCommunityManager(memberRole),
      createdAt: bulkOrder.createdAt,
    };
  });

  return ok({ bulkOrders: data });
});

export const POST = handleRoute(async (request) => {
  const user = await requireSessionUser();
  const body = await request.json();
  const input = createBulkOrderSchema.parse(body);

  await getCommunityMembershipOrThrow(input.communityId, user.id);

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  if (!restaurant || !restaurant.isActive) {
    throw new ValidationError("Restaurant is not available");
  }

  const deadline = new Date(input.orderDeadline);
  if (Number.isNaN(deadline.getTime())) {
    throw new ValidationError("Invalid orderDeadline");
  }
  if (deadline <= new Date()) {
    throw new ValidationError("orderDeadline must be in the future");
  }

  const bulkOrder = await prisma.bulkOrder.create({
    data: {
      communityId: input.communityId,
      restaurantId: input.restaurantId,
      hostUserId: user.id,
      title: input.title,
      orderDeadline: deadline,
      deliveryNotes:
        input.deliveryNotes && input.deliveryNotes.length > 0
          ? input.deliveryNotes
          : undefined,
      status: "OPEN",
      participants: {
        create: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: { select: { participants: true } },
    },
  });

  return ok(
    {
      bulkOrder: {
        id: bulkOrder.id,
        communityId: bulkOrder.communityId,
        restaurantId: bulkOrder.restaurantId,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        title: bulkOrder.title,
        orderDeadline: bulkOrder.orderDeadline,
        deliveryNotes: bulkOrder.deliveryNotes,
        status: bulkOrder.status,
        participantsCount: bulkOrder._count.participants,
        joined: true,
        isHost: true,
        canLock: true,
        createdAt: bulkOrder.createdAt,
      },
    },
    201,
  );
});
