import { verifyRefreshToken } from "../../infrastructure/security/token.service";
import { hashToken } from "../../infrastructure/security/encryption.service";
import { SessionRepository } from "../../infrastructure/persistence/session.repository";

import {
  generateFingerprint,
  compareFingerprint,
} from "../protections/fingerprint";

export class RefreshStrategy {
  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  /**
   * @param {string} refreshToken
   * @param {Request} req
   */
  async validate(refreshToken, req) {
    if (!refreshToken) {
      throw new Error("Unauthorized: Missing refresh token");
    }

    const payload = verifyRefreshToken(refreshToken);

    const { userId, sessionVersion } = payload;

    const tokenHash = await hashToken(refreshToken);

    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Unauthorized: Session not found");
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

    await this.sessionRepository.updateLastUsed(session._id);

    return {
      userId,
      sessionId: session._id,
      sessionVersion,
      fingerprint: currentFp,
    };
  }
}
