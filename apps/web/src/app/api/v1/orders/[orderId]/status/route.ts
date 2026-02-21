import { NextResponse } from "next/server";
import { orderService } from "@/server/modules/orders/service";
import { updateOrderStatusSchema } from "@/server/modules/orders/schemas";
import { errorResponse } from "@/server/lib/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = updateOrderStatusSchema.parse(body);
    const order = await orderService.updateStatus(orderId, status);
    return NextResponse.json({ data: order });
  } catch (error) {
    return errorResponse(error);
  }
}
