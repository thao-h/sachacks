import { prisma } from "@/server/db";
import { ok, handleRoute } from "@/server/contracts/api";
import { NotFoundError } from "@/server/lib/errors";

export const GET = handleRoute(async (_request, { params }) => {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      phone: true,
      menuItems: {
        where: { isAvailable: true },
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          imageUrl: true,
          category: true,
        },
        orderBy: { category: "asc" },
      },
    },
  });

  if (!restaurant) {
    throw new NotFoundError("Restaurant", slug);
  }

  return ok({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      address: restaurant.address || undefined,
      phone: restaurant.phone || undefined,
    },
    items: restaurant.menuItems,
  });
});
