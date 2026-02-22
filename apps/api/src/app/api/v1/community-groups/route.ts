import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO" } });
}

export async function POST(request: NextRequest) {
  // TODO: wire to backend-core service
  const body = await request.json();
  return NextResponse.json({ data: { message: "TODO", received: body } });
}
