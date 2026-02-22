import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await context.params;
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO", restaurantId } });
}
