import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

const getCookieFromRequest = (req, name) => {
  const cookieHeader = req.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      }),
  );

  return cookies[name];
};

export const generateCsrfToken = () => {
  return randomBytes(32).toString("hex");
};

export const setCsrfCookie = (response) => {
  const token = generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return token;
};

export const validateCsrf = async (req) => {
  const cookieToken = getCookieFromRequest(req, CSRF_COOKIE_NAME);
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  console.log("COOKIE TOKEN:", cookieToken);
  console.log("HEADER TOKEN:", headerToken);

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
  return async (req) => {
    const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];

    try {
      if (protectedMethods.includes(req.method)) {
        await validateCsrf(req);
      }

      return await handler(req);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "CSRF validation failed",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  };
};
