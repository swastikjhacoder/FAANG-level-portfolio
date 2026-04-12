import { Email } from "../../domain/valueObjects/Email.vo";
import { Password } from "../../domain/valueObjects/Password.vo";
import { Name } from "../../domain/valueObjects/Name.vo";

import { UserRepository } from "../../infrastructure/persistence/user.repository";
import { hashPassword } from "../../infrastructure/security/hash.service";

import { toSafeUser } from "../mapper/user.mapper";

import auditLogger from "@/shared/security/audit/audit.logger";

export class RegisterUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(dto, context = {}) {
    const { ip, userAgent } = context;

    const emailVO = new Email(dto.email);
    const passwordVO = new Password(dto.password);
    const nameVO = new Name(dto.name);

    const email = emailVO.value;

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

    return toSafeUser(createdUser);
  }
}
