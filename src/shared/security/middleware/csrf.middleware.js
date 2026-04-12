import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

export const generateCsrfToken = () => {
  return randomBytes(32).toString("hex");
};

export const setCsrfCookie = () => {
  const token = generateCsrfToken();

  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return token;
};

export const validateCsrf = (req) => {
  const cookieStore = cookies();

  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    throw new Error("CSRF token missing");
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    throw new Error("Invalid CSRF token");
  }

  return true;
};

export const withCsrf = (handler) => {
  return async (req, context = {}) => {
    const method = req.method;

    const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];

    try {
      if (protectedMethods.includes(method)) {
        validateCsrf(req);
      }

      return await handler(req, context);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "CSRF validation failed",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  };
};
