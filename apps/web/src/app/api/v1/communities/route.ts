import { z } from "zod";
import { ok, handleRoute } from "@/server/contracts/api";
import { prisma } from "@/server/db";
import { ValidationError } from "@/server/lib/errors";
import { DAVIS_AREAS } from "@/lib/davis-areas";
import { setSessionUser } from "@/lib/session";
import { generateInviteCode, requireSessionUser } from "@/server/modules/communities/utils";

const createCommunitySchema = z.object({
  name: z.string().trim().min(2).max(80),
  area: z.enum(DAVIS_AREAS),
  description: z.string().trim().max(280).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});

type CommunityListRow = {
  id: string;
  name: string;
  area: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: Date;
  members: { role: "OWNER" | "ADMIN" | "MEMBER" }[];
  _count: {
    members: number;
    bulkOrders: number;
  };
};

type CommunityListItem = {
  id: string;
  name: string;
  area: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  memberCount: number;
  openBulkOrderCount: number;
  joined: boolean;
  memberRole: "OWNER" | "ADMIN" | "MEMBER" | null;
  isAreaMatch: boolean;
  createdAt: Date;
};

type CommunityCreateResult = {
  id: string;
  name: string;
  area: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: Date;
  _count: {
    members: number;
    bulkOrders: number;
  };
};

type CommunityCreateTx = {
  community: {
    create: (args: {
      data: {
        name: string;
        area: string;
        description?: string;
        visibility: "PUBLIC" | "PRIVATE";
        createdByUserId: string;
        members: {
          create: {
            userId: string;
            role: "OWNER";
          };
        };
      };
      include: {
        _count: {
          select: {
            members: true;
            bulkOrders: { where: { status: "OPEN" } };
          };
        };
      };
    }) => Promise<CommunityCreateResult>;
  };
  communityInvite: {
    create: (args: {
      data: {
        communityId: string;
        code: string;
        createdByUserId: string;
        isActive: boolean;
      };
    }) => Promise<unknown>;
  };
};

export const GET = handleRoute(async (request) => {
  const user = await requireSessionUser();

  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const preferredArea = area ?? user.areaPreference ?? null;

  const where: {
    area?: string;
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      description?: { contains: string; mode: "insensitive" };
    }>;
  } = {};
  if (area) {
    where.area = area;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const communities = await prisma.community.findMany({
    where,
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

  const data: CommunityListItem[] = communities.map((community: CommunityListRow) => {
    const memberRole = community.members[0]?.role ?? null;
    const joined = memberRole !== null;

    return {
      id: community.id,
      name: community.name,
      area: community.area,
      description: community.description,
      visibility: community.visibility,
      memberCount: community._count.members,
      openBulkOrderCount: community._count.bulkOrders,
      joined,
      memberRole,
      isAreaMatch: preferredArea !== null && community.area === preferredArea,
      createdAt: community.createdAt,
    };
  });

  data.sort((a: CommunityListItem, b: CommunityListItem) => {
    if (preferredArea) {
      const aMatch = a.area === preferredArea;
      const bMatch = b.area === preferredArea;
      if (aMatch !== bMatch) return aMatch ? -1 : 1;
    }

    if (a.joined !== b.joined) return a.joined ? -1 : 1;
    if (a.memberCount !== b.memberCount) return b.memberCount - a.memberCount;
    return a.name.localeCompare(b.name);
  });

  return ok({
    communities: data,
    userAreaPreference: user.areaPreference ?? null,
    availableAreas: DAVIS_AREAS,
  });
});

export const POST = handleRoute(async (request) => {
  const user = await requireSessionUser();
  const body = await request.json();
  const input = createCommunitySchema.parse(body);

  const description =
    input.description && input.description.length > 0
      ? input.description
      : undefined;

  const inviteCode = input.visibility === "PRIVATE" ? generateInviteCode() : null;

  const community = await prisma.$transaction(async (tx: CommunityCreateTx) => {
    const created = await tx.community.create({
      data: {
        name: input.name,
        area: input.area,
        description,
        visibility: input.visibility,
        createdByUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            bulkOrders: { where: { status: "OPEN" } },
          },
        },
      },
    });

    if (inviteCode) {
      await tx.communityInvite.create({
        data: {
          communityId: created.id,
          code: inviteCode,
          createdByUserId: user.id,
          isActive: true,
        },
      });
    }

    return created;
  });

  if (!user.areaPreference) {
    await setSessionUser({ ...user, areaPreference: input.area });
  }

  if (input.visibility === "PRIVATE" && !inviteCode) {
    throw new ValidationError("Failed to generate invite code");
  }

  return ok(
    {
      community: {
        id: community.id,
        name: community.name,
        area: community.area,
        description: community.description,
        visibility: community.visibility,
        memberCount: community._count.members,
        openBulkOrderCount: community._count.bulkOrders,
        joined: true,
        memberRole: "OWNER",
        isAreaMatch: community.area === (user.areaPreference ?? input.area),
        createdAt: community.createdAt,
      },
      inviteCode,
    },
    201,
  );
});
