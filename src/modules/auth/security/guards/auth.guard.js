import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { RedisService } from "../../infrastructure/cache/redis.service";

const redis = new RedisService();

const getCookieFromRequest = (req, name) => {
  const cookieHeader = req.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      }),
  );

  return cookies[name];
};

const extractToken = (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return getCookieFromRequest(req, "accessToken");
};

export const authGuard = (handler) => {
  return async (req) => {
    try {
      const token = extractToken(req);

      console.log("TOKEN:", token);

      if (!token) {
        return new Response("Unauthorized: Missing token", { status: 401 });
      }

      let payload;
      try {
        payload = verifyAccessToken(token);
        console.log("PAYLOAD:", payload);
      } catch (err) {
        console.error("VERIFY FAILED:", err.message);
        return new Response("Invalid token", { status: 401 });
      }

      const jti = extractJTI(token);
      console.log("JTI:", jti);

      if (jti) {
        const isBlacklisted = await redis.isBlacklisted(jti);
        console.log("BLACKLISTED:", isBlacklisted);

        if (isBlacklisted) {
          return new Response("Unauthorized: Token revoked", {
            status: 401,
          });
        }
      }

      req.user = {
        userId: payload.userId,
        roles: payload.roles || [],
        sessionVersion: payload.sessionVersion,
        jti,
      };

      return await handler(req);
    } catch (err) {
      console.error("AUTH ERROR:", err);
      return new Response(err.message || "Unauthorized", { status: 401 });
    }
  };
};