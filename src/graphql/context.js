import { verifyToken } from "@/shared/utils/jwt";
import * as UserRepo from "@/modules/auth/infrastructure/persistence/user.repository";

const parseCookies = (cookieHeader = "") => {
  if (!cookieHeader || typeof cookieHeader !== "string") return {};

  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [rawKey, ...rest] = cookie.split("=");
    if (!rawKey) return acc;

    const key = rawKey.trim();
    const value = rest.join("=").trim();

    try {
      acc[key] = decodeURIComponent(value);
    } catch {
      acc[key] = value;
    }

    return acc;
  }, {});
};

const extractToken = (request) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);

    return cookies.accessToken || null;
  } catch {
    return null;
  }
};

export async function createContext({ request }) {
  let user = null;
  let token = null;

  try {
    token = extractToken(request);

    if (!token) {
      return {
        req: request,
        user: null,
        isAuthenticated: false,
      };
    }

    const decoded = await verifyToken(token);

    if (!decoded?.id) {
      throw new Error("Invalid token payload");
    }

    user = await UserRepo.getUserById(decoded.id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      throw new Error("Invalid session");
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Auth Context Error]:", err.message);
    }
    user = null;
  }

  return {
    req: request,
    user,
    token,
    isAuthenticated: Boolean(user),
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  };
}