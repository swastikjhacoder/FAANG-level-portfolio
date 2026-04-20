import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { RedisService } from "../../infrastructure/cache/redis.service";
import { cookies } from "next/headers";

const redis = new RedisService();

const extractToken = async (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;

  return token || null;
};

export const authGuard = (handler) => {
  return async (req) => {
    try {
      const token = await extractToken(req);

      if (!token) {
        return new Response("Unauthorized: Missing token", { status: 401 });
      }

      const payload = verifyAccessToken(token);
      const jti = extractJTI(token);

      if (jti) {
        const isBlacklisted = await redis.isBlacklisted(jti);

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

      return handler(req);
    } catch (err) {
      return new Response(err.message || "Unauthorized", { status: 401 });
    }
  };
};
