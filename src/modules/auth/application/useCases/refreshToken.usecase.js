import { hashToken } from "../../infrastructure/security/encryption.service";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../infrastructure/security/token.service";

import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import { UserRepository } from "../../infrastructure/persistence/user.repository";

import auditLogger from "@/shared/security/audit/audit.logger";

export class RefreshTokenUseCase {
  constructor() {
    this.sessionRepository = new SessionRepository();
    this.userRepository = new UserRepository();
  }

  async execute(refreshToken, context = {}) {
    const { ip, userAgent } = context;

    const tokenHash = await hashToken(refreshToken);

    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Invalid refresh token");
    }

    if (session.isRevoked) {
      await this.sessionRepository.revokeAllUserSessions(session.userId);

      await auditLogger.log({
        action: "TOKEN_REUSE_DETECTED",
        userId: session.userId,
        ip,
        userAgent,
      });

      throw new Error("Session compromised. Please login again.");
    }

    if (new Date() > new Date(session.expiresAt)) {
      await this.sessionRepository.revokeSession(session._id);

      throw new Error("Refresh token expired");
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (session.sessionVersion !== user.sessionVersion) {
      await this.sessionRepository.revokeAllUserSessions(user._id);

      throw new Error("Session invalidated. Please login again.");
    }

    await this.sessionRepository.revokeSession(session._id);

    const newAccessToken = generateAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: user.sessionVersion,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id,
      sessionVersion: user.sessionVersion,
    });

    const newHash = await hashToken(newRefreshToken);

    const newSession = await this.sessionRepository.create({
      userId: user._id,
      refreshTokenHash: newHash,
      userAgent,
      ip,
      rotatedFrom: session._id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    await auditLogger.log({
      action: "TOKEN_ROTATED",
      userId: user._id,
      ip,
      userAgent,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: newSession._id,
    };
  }
}
