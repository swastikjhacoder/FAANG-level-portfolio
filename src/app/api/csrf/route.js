import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/shared/security/middleware/csrf.middleware";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  let token = cookieStore.get("csrfToken")?.value;

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
