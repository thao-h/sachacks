import { NextResponse } from "next/server";
import { orderService } from "@/server/modules/orders/service";
import { createOrderSchema } from "@/server/modules/orders/schemas";
import { errorResponse, ValidationError } from "@/server/lib/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) {
      throw new ValidationError("restaurantId query parameter is required");
    }
    const orders = await orderService.listByRestaurant(restaurantId);
    return NextResponse.json({ data: orders });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const order = await orderService.createOrder(input);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
