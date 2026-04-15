import { generateTokenWithMeta } from "@/shared/utils/hash";
import crypto from "crypto";

export class ResendVerificationUseCase {
  constructor({ userRepository, emailService, logger }) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }

  async execute({ email }) {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      return {
        success: true,
        message: "If the email exists, a verification link has been sent",
      };
    }

    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    const { raw: rawToken, hash: hashedToken } = generateTokenWithMeta();

    await this.userRepository.updateById(user._id, {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 15,
    });

    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${rawToken}`;

    await this.emailService.sendVerificationEmail(user.email, verifyUrl);

    this.logger.info("Verification email resent", {
      userId: user._id.toString(),
    });

    return {
      success: true,
      message: "Verification email sent",
    };
  }
}
