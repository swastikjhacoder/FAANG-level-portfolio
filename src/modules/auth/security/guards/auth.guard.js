import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { RedisService } from "../../infrastructure/cache/redis.service";

const redis = new RedisService();

const extractToken = (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const authGuard = async (req) => {
  const token = extractToken(req);

  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }

  const payload = verifyAccessToken(token);

  const jti = extractJTI(token);

  if (jti) {
    const isBlacklisted = await redis.isBlacklisted(jti);

    if (isBlacklisted) {
      throw new Error("Unauthorized: Token revoked");
    }
  }
  
  return {
    userId: payload.userId,
    roles: payload.roles || [],
    sessionVersion: payload.sessionVersion,
    jti,
  };
};
