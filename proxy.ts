import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionToken = process.env.AUTH_SECRET?.trim();
  if (!sessionToken) return NextResponse.next(); // no auth configured

  const cookie = req.cookies.get("auth-token")?.value;
  if (cookie !== sessionToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|logo-light.png|api).*)"],
};
