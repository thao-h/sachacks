import { NextResponse } from "next/server";

export async function GET() {
  // TODO: wire to backend-core service
  return NextResponse.json({ data: { message: "TODO" } });
}
