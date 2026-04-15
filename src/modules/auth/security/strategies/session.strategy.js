import mongoose from "mongoose";

import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { RedisService } from "../../infrastructure/cache/redis.service";

const sessionRepository = new SessionRepository();
const userRepository = new UserRepository();
const redis = new RedisService();

const extractToken = (req) => {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const sessionStrategy = async (req, options = {}) => {
  const {
    checkBlacklist = true,
    checkSession = true,
    checkSessionVersion = true,
  } = options;

  const token = extractToken(req);

  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }

  const payload = verifyAccessToken(token);

  const { userId, sessionVersion } = payload;

  if (!userId) {
    throw new Error("Unauthorized: Invalid token payload");
  }

  if (checkBlacklist) {
    const jti = extractJTI(token);

    if (jti) {
      const isBlacklisted = await redis.isBlacklisted(jti);

      if (isBlacklisted) {
        throw new Error("Unauthorized: Token revoked");
      }
    }
  }

  let session = null;

  if (checkSession) {
    if (!payload.sessionId) {
      throw new Error("Unauthorized: Missing sessionId");
    }

    const sessionId = new mongoose.Types.ObjectId(payload.sessionId);

    session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw new Error("Unauthorized: Session not found");
    }

    if (session.isRevoked) {
      throw new Error("Unauthorized: Session revoked");
    }

    if (new Date() > new Date(session.expiresAt)) {
      throw new Error("Unauthorized: Session expired");
    }

    await sessionRepository.updateLastUsed(sessionId);
  }

  if (checkSessionVersion) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("Unauthorized: User not found");
    }

    if (user.sessionVersion !== sessionVersion) {
      throw new Error("Unauthorized: Session invalidated");
    }
  }

  return {
    userId,
    roles: payload.roles || [],
    sessionId: payload.sessionId,
    sessionVersion,
    jti: extractJTI(token),
  };
};
