import crypto from "crypto";

import { Email } from "../../domain/valueObjects/Email.vo";
import { Password } from "../../domain/valueObjects/Password.vo";

import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { SessionRepository } from "../../infrastructure/persistence/session.repository";

import { comparePassword, hashPassword, hashToken } from "@/shared/utils/hash";

import { toSafeUser } from "../mapper/user.mapper";

import auditLogger from "@/shared/security/audit/audit.logger";
import { signAccessToken } from "@/shared/utils/jwt";

const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO9r9GqQ8K/ux6j7a8qG9Q5e5e5e5e5eO";

const MAX_ATTEMPTS = 5;
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;

export class LoginUseCase {
  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async execute(dto, context = {}) {
    const { ip, userAgent, deviceFingerprint } = context;

    const emailVO = new Email(dto.email);
    const passwordVO = new Password(dto.password);

    const email = emailVO.value;

    const user = await this.userRepository.findByEmail(email, {
      includePassword: true,
    });

    const passwordHash = user?.passwordHash || DUMMY_HASH;

    const { valid, needsUpgrade } = await comparePassword(
      passwordVO.value,
      passwordHash,
    );

    if (!user || !valid) {
      if (user) {
        const updatedUser = await this.userRepository.incrementFailedAttempts(
          user._id,
        );

        if (updatedUser.failedLoginAttempts >= MAX_ATTEMPTS) {
          await this.userRepository.lockAccount(user._id);
        }
      }

      await auditLogger.log({
        action: "LOGIN_FAILED",
        email,
        ip,
        userAgent,
      });

      throw new Error("Invalid credentials");
    }

    if (needsUpgrade) {
      const normalized = passwordVO.value.trim().normalize("NFKC");
      const newHash = await hashPassword(normalized);

      await this.userRepository.updateById(user._id, {
        passwordHash: newHash,
      });
    }

    if (user.isLocked) {
      throw new Error("Account locked. Try later.");
    }

    if (!user.isVerified) {
      throw new Error("Email not verified");
    }

    await this.userRepository.resetFailedAttempts(user._id);

    const fingerprint = deviceFingerprint || userAgent || "unknown";

    const rawRefreshToken = `${crypto.randomUUID()}`;
    const refreshTokenHash = hashToken(rawRefreshToken);

    const session = await this.sessionRepository.create({
      userId: user._id,
      currentTokenHash: refreshTokenHash,
      previousTokenHash: null,
      fingerprint,
      userAgent,
      ip,
      sessionVersion: user.sessionVersion || 0,
      isRevoked: false,
      expiresAt: new Date(Date.now() + REFRESH_TTL),
    });

    const accessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: session.sessionVersion,
      sessionId: session._id.toString(),
    });

    await this.userRepository.updateLoginMetadata(user._id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });

    await auditLogger.log({
      action: "LOGIN_SUCCESS",
      userId: user._id,
      sessionId: session._id,
      ip,
      userAgent,
    });

    return {
      user: toSafeUser(user),
      accessToken,
      sessionId: session._id,
      refreshToken: rawRefreshToken,
    };
  }
}
