import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ deliveryId: string }> }
) {
  const { deliveryId } = await context.params;
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO", deliveryId } });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ deliveryId: string }> }
) {
  const { deliveryId } = await context.params;
  const body = await request.json();
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO", deliveryId, received: body } });
}
