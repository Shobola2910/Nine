import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin/auth";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const secret = process.env.ADMIN_SESSION_SECRET ?? "";
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = secret ? await verifySessionToken(token, secret) : false;

    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(uz|ru|en)/:path*", "/admin/:path*"],
};
