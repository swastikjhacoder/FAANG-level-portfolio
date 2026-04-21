import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/shared/security/middleware/csrf.middleware";

const getCookieFromRequest = (req, name) => {
  const cookieHeader = req.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    }),
  );

  return cookies[name];
};

export async function GET(req) {
  let token = getCookieFromRequest(req, "csrfToken");

  if (!token) {
    token = generateCsrfToken();
  }

  const res = NextResponse.json({
    success: true,
    csrfToken: token,
  });

  res.cookies.set("csrfToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}
