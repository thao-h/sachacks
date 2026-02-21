import { NextResponse } from "next/server";
import { dispatchService } from "@/server/modules/dispatch/service";
import { createAssignmentSchema } from "@/server/modules/dispatch/schemas";
import { errorResponse } from "@/server/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createAssignmentSchema.parse(body);
    const assignment = await dispatchService.assignDriver(input);
    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
