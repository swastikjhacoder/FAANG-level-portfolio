import { hashToken, generateTokenWithMeta } from "@/shared/utils/hash";

import { signAccessToken as generateAccessToken } from "@/shared/utils/jwt";

import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import { UserRepository } from "../../infrastructure/persistence/user.repository";

import auditLogger from "@/shared/security/audit/audit.logger";

export class RefreshTokenUseCase {
  constructor() {
    this.sessionRepository = new SessionRepository();
    this.userRepository = new UserRepository();
  }

  async execute(refreshToken, context = {}) {
    const { ip, userAgent, deviceFingerprint } = context;

    const tokenHash = hashToken(refreshToken);

    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Invalid refresh token");
    }

    if (session.previousTokenHash === tokenHash) {
      await this.sessionRepository.revokeAllUserSessions(session.userId);

      await auditLogger.log({
        action: "TOKEN_REUSE_DETECTED",
        userId: session.userId,
        ip,
        userAgent,
      });

      throw new Error("Session hijacking detected. Please login again.");
    }

    if (session.isRevoked) {
      await this.sessionRepository.revokeAllUserSessions(session.userId);

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

    if (
      user.sessionVersion !== undefined &&
      session.sessionVersion !== undefined &&
      session.sessionVersion !== user.sessionVersion
    ) {
      await this.sessionRepository.revokeAllUserSessions(user._id);

      throw new Error("Session invalidated. Please login again.");
    }

    const fingerprint = deviceFingerprint || userAgent || "unknown";

    if (session.fingerprint && session.fingerprint !== fingerprint) {
      await this.sessionRepository.revokeAllUserSessions(session.userId);

      await auditLogger.log({
        action: "DEVICE_MISMATCH",
        userId: session.userId,
        ip,
        userAgent,
      });

      throw new Error("Device mismatch detected");
    }

    const { raw: newRefreshToken, hash: newHash } = generateTokenWithMeta();

    session.previousTokenHash = session.currentTokenHash;
    session.currentTokenHash = newHash;
    session.lastUsedAt = new Date();

    await this.sessionRepository.save(session);

    const newAccessToken = generateAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: user.sessionVersion,
      sessionId: session._id,
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
      sessionId: session._id,
    };
  }
}
