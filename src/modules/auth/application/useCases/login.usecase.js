import bcrypt from "bcryptjs";

import { Email } from "../../domain/valueObjects/Email.vo";
import { Password } from "../../domain/valueObjects/Password.vo";

import { UserRepository } from "../../infrastructure/persistence/user.repository";
import { SessionRepository } from "../../infrastructure/persistence/session.repository";

import { hashToken } from "../../infrastructure/security/encryption.service";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../infrastructure/security/token.service";

import { toSafeUser } from "../mapper/user.mapper";

import auditLogger from "@/shared/security/audit/audit.logger";

const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO9r9GqQ8K/ux6j7a8qG9Q5e5e5e5e5eO";

const MAX_ATTEMPTS = 5;

export class LoginUseCase {
  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async execute(dto, context = {}) {
    const { ip, userAgent } = context;

    const emailVO = new Email(dto.email);

    const email = emailVO.value;
    
    const passwordVO = new Password(dto.password);

    const user = await this.userRepository.findByEmail(email, {
      includePassword: true,
    });

    const passwordHash = user?.passwordHash || DUMMY_HASH;

    const isPasswordValid = await bcrypt.compare(
      passwordVO.value,
      passwordHash,
    );

    if (!user || !isPasswordValid) {
      if (user) {
        await this.userRepository.incrementFailedAttempts(user._id);

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

    if (user.isLocked) {
      throw new Error("Account locked. Try later.");
    }

    if (!user.isVerified) {
      throw new Error("Email not verified");
    }

    await this.userRepository.resetFailedAttempts(user._id);

    const accessToken = generateAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: user.sessionVersion,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      sessionVersion: user.sessionVersion,
    });

    const refreshTokenHash = await hashToken(refreshToken);

    const session = await this.sessionRepository.create({
      userId: user._id,
      refreshTokenHash,
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    await this.userRepository.updateLoginMetadata(user._id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });

    await auditLogger.log({
      action: "LOGIN_SUCCESS",
      userId: user._id,
      ip,
      userAgent,
    });

    return {
      user: toSafeUser(user),
      accessToken,
      sessionId: session._id,
      refreshToken,
    };
  }
}
