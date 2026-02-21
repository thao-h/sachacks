import { NextResponse } from "next/server";
import { driverService } from "@/server/modules/drivers/service";
import { errorResponse } from "@/server/lib/errors";

export async function GET() {
  try {
    const drivers = await driverService.listActive();
    return NextResponse.json({ data: drivers });
  } catch (error) {
    return errorResponse(error);
  }
}
