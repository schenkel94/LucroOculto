import { NextResponse, type NextRequest } from "next/server";

const blockedPathPatterns = [
  /^\/\.env/i,
  /^\/wp-/i,
  /^\/wordpress/i,
  /^\/xmlrpc\.php/i,
  /^\/phpmyadmin/i
];

export function proxy(request: NextRequest) {
  if (request.headers.has("x-middleware-subrequest")) {
    return new NextResponse("Blocked", { status: 403 });
  }

  if (blockedPathPatterns.some((pattern) => pattern.test(request.nextUrl.pathname))) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
