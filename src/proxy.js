import { NextResponse } from "next/server";

const isSafeMethod = (method) => {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
};

export function proxy(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const res = NextResponse.next();

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
  );

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/api")) {
    if (isSafeMethod(method)) {
      return res;
    }

    if (pathname.startsWith("/api/auth") || pathname === "/api/csrf") {
      return res;
    }

    const csrfHeader = req.headers.get("x-csrf-token");

    const cookieHeader = req.headers.get("cookie") || "";
    const csrfCookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("csrfToken="))
      ?.split("=")[1];

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json(
        { success: false, message: "Invalid CSRF token" },
        { status: 403 },
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
