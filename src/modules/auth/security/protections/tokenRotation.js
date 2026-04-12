import { hashToken } from "../../infrastructure/security/encryption.service";
import {
  verifyRefreshToken,
  generateRefreshToken,
} from "../../infrastructure/security/token.service";

import { generateFingerprint, compareFingerprint } from "./fingerprint";

export class TokenRotationService {
  constructor(sessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  /**
   * @param {string} refreshToken
   * @param {Request} req
   */
  async rotate(refreshToken, req) {
    const payload = verifyRefreshToken(refreshToken);

    const userId = payload.userId;

    const tokenHash = await hashToken(refreshToken);

    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Invalid session");
    }

    if (session.isRevoked) {
      await this.sessionRepository.revokeAllUserSessions(session.userId);

      throw new Error("Refresh token reuse detected");
    }

    if (new Date() > new Date(session.expiresAt)) {
      throw new Error("Session expired");
    }

    const currentFp = generateFingerprint(req);

    if (session.fingerprint) {
      const isValidDevice = compareFingerprint(currentFp, session.fingerprint);

      if (!isValidDevice) {
        await this.sessionRepository.revokeAllUserSessions(session.userId);

        throw new Error("Device mismatch detected");
      }
    }
    
    const newRefreshToken = generateRefreshToken({
      userId,
      sessionVersion: payload.sessionVersion,
    });

    const newHash = await hashToken(newRefreshToken);

    const newSession = await this.sessionRepository.rotateSession(session._id, {
      userId,
      refreshTokenHash: newHash,
      userAgent: session.userAgent,
      ip: session.ip,
      fingerprint: currentFp,
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7,
      ),
    });

    await this.sessionRepository.updateLastUsed(session._id);

    return {
      userId,
      sessionId: newSession._id,
      refreshToken: newRefreshToken,
    };
  }
}
