import { NextResponse } from "next/server";
import { menuService } from "@/server/modules/menu/service";
import { errorResponse } from "@/server/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  try {
    const { restaurantId } = await params;
    const items = await menuService.getMenuForRestaurant(restaurantId);
    return NextResponse.json({ data: items });
  } catch (error) {
    return errorResponse(error);
  }
}
