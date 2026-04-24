import mongoose from "mongoose";
import { cookies } from "next/headers";

import { verifyAccessToken, extractJTI } from "@/shared/utils/jwt";

import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { RedisService } from "../../infrastructure/cache/redis.service";

const sessionRepository = new SessionRepository();
const userRepository = new UserRepository();
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

export const sessionStrategy = async (req, options = {}) => {
  const {
    checkBlacklist = true,
    checkSession = true,
    checkSessionVersion = true,
  } = options;

  const token = await extractToken(req);

  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }

  const payload = verifyAccessToken(token);

  const { userId, sessionVersion, sessionId } = payload;

  if (!userId) {
    throw new Error("Unauthorized: Invalid token payload");
  }

  if (checkBlacklist) {
    const jti = extractJTI(token);

    if (jti && (await redis.isBlacklisted(jti))) {
      throw new Error("Unauthorized: Token revoked");
    }
  }

  let session = null;

  if (checkSession) {
    if (!sessionId) {
      throw new Error("Unauthorized: Missing sessionId");
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new Error("Unauthorized: Invalid sessionId");
    }

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

    sessionRepository.updateLastUsed(sessionId).catch(() => {});
  }

  if (checkSessionVersion) {
    if (session) {
      if (session.sessionVersion !== sessionVersion) {
        throw new Error("Unauthorized: Session invalidated");
      }
    } else {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error("Unauthorized: User not found");
      }

      if (user.sessionVersion !== sessionVersion) {
        throw new Error("Unauthorized: Session invalidated");
      }
    }
  }

  return {
    userId,
    roles: payload.roles || [],
    sessionId,
    sessionVersion,
    jti: extractJTI(token),
  };
};
