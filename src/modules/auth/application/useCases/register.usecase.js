import { Email } from "../../domain/valueObjects/Email.vo";
import { Password } from "../../domain/valueObjects/Password.vo";
import { Name } from "../../domain/valueObjects/Name.vo";

import { UserRepository } from "../../infrastructure/persistence/user.repository";
import { hashPassword } from "@/shared/utils/hash";

import { toSafeUser } from "../mapper/user.mapper";

import auditLogger from "@/shared/security/audit/audit.logger";

import crypto from "crypto";
import { generateTokenWithMeta } from "@/shared/utils/hash";

export class RegisterUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(dto, context = {}) {
    const { ip, userAgent, deviceFingerprint } = context;

    const emailVO = new Email(dto.email);
    const passwordVO = new Password(dto.password);
    const nameVO = new Name(dto.name);

    const email = emailVO.value;
    const { raw: rawToken, hash: hashedToken } = generateTokenWithMeta();

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      await auditLogger.log({
        action: "REGISTER_FAILED_DUPLICATE",
        email,
        ip,
        userAgent,
      });

      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(passwordVO.value);

    const userData = {
      email,
      passwordHash,

      name: {
        firstName: nameVO.firstName,
        lastName: nameVO.lastName,
        displayName: nameVO.displayName,
      },

      roles: ["USER"],
      isVerified: false,

      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 15,

      failedLoginAttempts: 0,
      isLocked: false,
      mfaEnabled: false,
      sessionVersion: 0,

      createdByIp: ip,
      lastLoginIp: ip,
    };

    const createdUser = await this.userRepository.create(userData);

    await auditLogger.log({
      action: "REGISTER_SUCCESS",
      userId: createdUser._id,
      email,
      ip,
      userAgent,
    });

    return {
      user: toSafeUser(createdUser),
      verificationToken: rawToken,
    };
  }
}
