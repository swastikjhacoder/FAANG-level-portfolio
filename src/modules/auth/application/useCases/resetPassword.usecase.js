import crypto from "crypto";
import bcrypt from "bcryptjs";
import { validatePassword } from "../../domain/policies/password/validatePassword";

export class ResetPasswordUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ token, password }) {
    if (!token || !password) {
      throw new Error("Invalid request");
    }

    validatePassword(password);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    await this.userRepository.resetPassword(user._id, passwordHash);
  }
}
