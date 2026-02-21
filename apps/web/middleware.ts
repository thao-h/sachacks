import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // TODO: Add role-based route protection
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/board/:path*"],
};
