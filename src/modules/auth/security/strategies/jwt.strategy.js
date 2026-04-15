import {
  verifyAccessToken,
  extractJTI,
} from "../../infrastructure/security/token.service";
import { RedisService } from "../../infrastructure/cache/redis.service";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";

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

  if (checkBlacklist) {
    const jti = extractJTI(token);

    if (jti) {
      const isBlacklisted = await redis.isBlacklisted(jti);

      if (isBlacklisted) {
        throw new Error("Unauthorized: Token revoked");
      }
    }
  }

  if (checkSessionVersion) {
    const user = await userRepository.findByEmail(payload.email);

    if (!user) {
      throw new Error("Unauthorized: User not found");
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      throw new Error("Unauthorized: Session invalidated");
    }
  }

  return {
    userId: payload.userId,
    roles: payload.roles || [],
    sessionVersion: payload.sessionVersion,
    jti: extractJTI(token),
  };
};
