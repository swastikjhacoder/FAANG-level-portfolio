import { hashToken, generateTokenWithMeta } from "@/shared/utils/hash";
import { signAccessToken as generateAccessToken } from "@/shared/utils/jwt";

import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import { UserRepository } from "../../infrastructure/persistence/user.repository";

import auditLogger from "@/shared/security/audit/audit.logger";
import crypto from "crypto";

const generateFingerprint = (userAgent, ip) => {
  return crypto
    .createHash("sha256")
    .update(
      `${userAgent}-${ip}-${process.env.FINGERPRINT_SECRET || "dev-secret"}`,
    )
    .digest("hex");
};

export class RefreshTokenUseCase {
  constructor() {
    this.sessionRepository = new SessionRepository();
    this.userRepository = new UserRepository();
  }

  async execute(refreshToken, context = {}) {
    const { ip, userAgent, deviceFingerprint } = context;

    const incomingHash = hashToken(refreshToken);

    const session = await this.sessionRepository.findByTokenHash(incomingHash);

    if (!session) {
      throw new Error("Invalid refresh token");
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (incomingHash === session.previousTokenHash) {
      await this.sessionRepository.revokeAllUserSessions(user._id);

      await auditLogger.tokenReuseDetected({
        userId: user._id,
        ip,
        userAgent,
      });

      throw new Error("Session compromised (token reuse detected)");
    }

    if (incomingHash !== session.currentTokenHash) {
      throw new Error("Invalid refresh token");
    }

    if (session.isRevoked) {
      await this.sessionRepository.revokeAllUserSessions(user._id);
      throw new Error("Session revoked");
    }

    if (new Date() > new Date(session.expiresAt)) {
      await this.sessionRepository.revokeSession(session._id);
      throw new Error("Refresh token expired");
    }

    if (
      user.sessionVersion !== undefined &&
      session.sessionVersion !== user.sessionVersion
    ) {
      await this.sessionRepository.revokeAllUserSessions(user._id);
      throw new Error("Session invalidated");
    }

    const currentFingerprint =
      deviceFingerprint || generateFingerprint(userAgent, ip);

    if (session.fingerprint && session.fingerprint !== currentFingerprint) {
      await this.sessionRepository.revokeSession(session._id);

      await auditLogger.log({
        action: "SESSION_HIJACK_DETECTED",
        userId: user._id,
        ip,
        userAgent,
      });

      throw new Error("Session hijacking detected");
    }

    const { raw: newRefreshToken, hash: newHash } = generateTokenWithMeta();

    await this.sessionRepository.updateTokenRotation(session._id, {
      previousTokenHash: session.currentTokenHash,
      currentTokenHash: newHash,
      lastUsedAt: new Date(),
    });

    const accessToken = generateAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: user.sessionVersion,
      sessionId: session._id,
    });

    await auditLogger.log({
      action: "TOKEN_ROTATED",
      userId: user._id,
      sessionId: session._id,
      ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: session._id,
    };
  }
}
