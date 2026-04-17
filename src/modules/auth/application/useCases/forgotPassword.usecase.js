import crypto from "crypto";

export class ForgotPasswordUseCase {
  constructor({ userRepository, mailService }) {
    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  async execute({ email }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.updateById(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: expiry,
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${rawToken}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetLink);
  }
}
