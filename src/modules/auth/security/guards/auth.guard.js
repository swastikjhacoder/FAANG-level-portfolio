import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { RedisService } from "../../infrastructure/cache/redis.service";
import { cookies } from "next/headers";

const redis = new RedisService();
const isValidToken = (t) =>
  typeof t === "string" && t.trim() !== "" && t !== "undefined" && t !== "null";

const extractToken = async (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  let token = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (isValidToken(token)) {
    return token;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("accessToken")?.value;

  return isValidToken(cookieToken) ? cookieToken : null;
};

export const authGuard = (handler) => {
  return async (req) => {
    try {
      const token = await extractToken(req);

      if (!token) {
        return new Response("Unauthorized: Missing token", { status: 401 });
      }

      let payload;
      try {
        payload = verifyAccessToken(token);
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
        id: payload.userId,
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
