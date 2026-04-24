import { randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

export const generateCsrfToken = () => {
  return randomBytes(32).toString("hex");
};

export const setCsrfCookie = (response) => {
  const token = generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return token;
};

export const validateCsrf = async (req) => {
  const cookieStore = await cookies();

  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    throw new Error("CSRF token missing");
  }

  const cookieBuffer = Buffer.from(cookieToken, "utf-8");
  const headerBuffer = Buffer.from(headerToken, "utf-8");

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    throw new Error("Invalid CSRF token");
  }

  return true;
};

export const withCsrf = (handler) => {
  return async (req) => {
    const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];

    try {
      if (protectedMethods.includes(req.method)) {
        await validateCsrf(req);
      }

      return await handler(req);
    } catch (error) {
      console.error("REAL ERROR:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  };
};
