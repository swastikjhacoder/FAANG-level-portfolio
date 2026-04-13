import crypto from "crypto";

/**
 *
 * @param {Object} deps
 * @param {Object} deps.userRepository
 * @param {Object} deps.logger
 *
 * @param {Object} input
 * @param {string} input.token
 *
 * @returns {Promise<{ success: boolean }>}
 */
export const verifyEmailUseCase = async (
  { userRepository, logger },
  { token },
) => {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userRepository.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await userRepository.save(user);

    logger.info("Email verified", {
      userId: user._id?.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (err) {
    logger.error("Email verification failed", {
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};
