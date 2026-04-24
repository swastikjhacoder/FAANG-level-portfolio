import { verifyAccessToken, extractJTI } from "@/shared/utils/jwt";

import { RedisService } from "../../infrastructure/cache/redis.service";
import SessionModel from "@/modules/auth/infrastructure/persistence/session.schema";

import { cookies } from "next/headers";

const redis = new RedisService();

const extractToken = async (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
};

export const authGuard = (handler) => {
  return async (req) => {
    try {
      const token = await extractToken(req);

      if (!token) {
        return new Response("Unauthorized", { status: 401 });
      }

      const payload = verifyAccessToken(token);
      const jti = extractJTI(token);

      if (jti && (await redis.isBlacklisted(jti))) {
        return new Response("Token revoked", { status: 401 });
      }

      if (!payload.sessionId) {
        return new Response("Invalid token payload", { status: 401 });
      }

      const session = await SessionModel.findById(payload.sessionId);

      if (!session || session.isRevoked) {
        return new Response("Session invalid", { status: 401 });
      }

      if (session.sessionVersion !== payload.sessionVersion) {
        return new Response("Session expired", { status: 401 });
      }

      req.user = {
        userId: payload.userId,
        roles: payload.roles || [],
        sessionVersion: payload.sessionVersion,
        sessionId: payload.sessionId,
        jti,
      };

      return handler(req);
    } catch (err) {
      console.error("AUTH ERROR:", err.message);
      return new Response("Unauthorized", { status: 401 });
    }
  };
};
