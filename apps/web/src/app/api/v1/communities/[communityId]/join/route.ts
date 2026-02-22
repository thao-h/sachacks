import { z } from "zod";
import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import { ValidationError } from "@/server/lib/errors";
import { requireSessionUser } from "@/server/modules/communities/utils";

const joinCommunitySchema = z.object({
  inviteCode: z.string().trim().min(4).max(32).optional(),
});

export const POST = handleRoute(async (request, { params }) => {
  const user = await requireSessionUser();
  const { communityId } = await params;
  const body = await request.json();
  const { inviteCode } = joinCommunitySchema.parse(body);

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
      _count: {
        select: {
          members: true,
          bulkOrders: { where: { status: "OPEN" } },
        },
      },
    },
  });

  if (!community) {
    throw new ValidationError("Community not found");
  }

  const existingRole = community.members[0]?.role ?? null;
  if (existingRole) {
    return ok({
      community: {
        id: community.id,
        name: community.name,
        area: community.area,
        description: community.description,
        visibility: community.visibility,
        memberCount: community._count.members,
        openBulkOrderCount: community._count.bulkOrders,
        joined: true,
        memberRole: existingRole,
        isAreaMatch: user.areaPreference === community.area,
        createdAt: community.createdAt,
      },
    });
  }

  if (community.visibility === "PRIVATE") {
    if (!inviteCode) {
      throw new ValidationError("Invite code is required for private communities");
    }

    const validInvite = await prisma.communityInvite.findFirst({
      where: {
        communityId,
        code: inviteCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });

    if (!validInvite) {
      throw new ValidationError("Invalid or expired invite code");
    }
  }

  const createdMembership = await prisma.communityMember.create({
    data: {
      communityId,
      userId: user.id,
      role: "MEMBER",
    },
  });

  return ok({
    community: {
      id: community.id,
      name: community.name,
      area: community.area,
      description: community.description,
      visibility: community.visibility,
      memberCount: community._count.members + 1,
      openBulkOrderCount: community._count.bulkOrders,
      joined: true,
      memberRole: createdMembership.role,
      isAreaMatch: user.areaPreference === community.area,
      createdAt: community.createdAt,
    },
  });
});
