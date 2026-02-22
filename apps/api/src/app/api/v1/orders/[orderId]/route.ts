import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO", orderId } });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const body = await request.json();
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO", orderId, received: body } });
}
