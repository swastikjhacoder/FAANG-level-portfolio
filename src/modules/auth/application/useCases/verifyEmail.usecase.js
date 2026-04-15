import { ValidationError } from "@/shared/errors";
import { hashToken } from "@/shared/utils/hash";

export const verifyEmailUseCase = async (
  { userRepository, logger },
  { token },
) => {
  try {
    if (!token || typeof token !== "string") {
      throw new ValidationError("Verification token is required");
    }

    const normalizedToken = token.trim();
    const hashedToken = hashToken(normalizedToken);

    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new ValidationError("Invalid or expired verification token");
    }

    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    await userRepository.updateById(user._id, {
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    logger.info("EMAIL_VERIFIED", {
      userId: user._id?.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (err) {
    logger.error("EMAIL_VERIFICATION_FAILED", {
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};
