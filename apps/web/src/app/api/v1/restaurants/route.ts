import { prisma } from "@/server/db";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async () => {
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      phone: true,
      _count: { select: { menuItems: { where: { isAvailable: true } } } },
    },
    orderBy: { name: "asc" },
  });

  const data = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address || undefined,
    phone: r.phone || undefined,
    itemCount: r._count.menuItems,
  }));

  return ok(data);
});
