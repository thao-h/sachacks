import { prisma } from "@/server/db";
import { ok, handleRoute } from "@/server/contracts/api";

export const GET = handleRoute(async (_request, { params }) => {
  const { driverId } = await params;
  const completedDeliveries = await prisma.dispatchAssignment.count({
    where: { driverId, status: "DROPPED_OFF" },
  });
  return ok({ completedDeliveries, todayEarnings: 0 });
});
