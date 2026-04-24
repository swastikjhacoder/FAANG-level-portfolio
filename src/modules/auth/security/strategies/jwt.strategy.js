import { verifyAccessToken, extractJTI } from "@/shared/utils/jwt";

import { RedisService } from "../../infrastructure/cache/redis.service";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import SessionModel from "@/modules/auth/infrastructure/persistence/session.schema";

const redis = new RedisService();
const userRepository = new UserRepository();

const extractToken = (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const jwtStrategy = async (req, options = {}) => {
  const { checkBlacklist = true, checkSessionVersion = true } = options;

  const token = extractToken(req);

  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }

  const payload = verifyAccessToken(token);

  const jti = extractJTI(token);

  if (checkBlacklist && jti) {
    const isBlacklisted = await redis.isBlacklisted(jti);

    if (isBlacklisted) {
      throw new Error("Unauthorized: Token revoked");
    }
  }

  if (checkSessionVersion) {
    if (!payload.sessionId) {
      throw new Error("Unauthorized: Missing sessionId");
    }
    
    const session = await SessionModel.findById(payload.sessionId);

    if (!session || session.isRevoked) {
      throw new Error("Unauthorized: Session invalid");
    }

    if (session.sessionVersion !== payload.sessionVersion) {
      throw new Error("Unauthorized: Session invalidated");
    }
  }

  const user = await userRepository.findById(payload.userId);

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  return {
    userId: payload.userId,
    roles: payload.roles || [],
    sessionVersion: payload.sessionVersion,
    sessionId: payload.sessionId,
    jti,
  };
};
