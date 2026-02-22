export { prisma } from "./client";
export type { PrismaClient } from "@prisma/client";
export { restaurantsPrismaRepo } from "./repositories/restaurants.prisma-repo";
export { menusPrismaRepo } from "./repositories/menus.prisma-repo";
export { ordersPrismaRepo } from "./repositories/orders.prisma-repo";
export { deliveriesPrismaRepo } from "./repositories/deliveries.prisma-repo";
export { driversPrismaRepo } from "./repositories/drivers.prisma-repo";
export { communityGroupsPrismaRepo } from "./repositories/community-groups.prisma-repo";
export { routePostsPrismaRepo } from "./repositories/route-posts.prisma-repo";
