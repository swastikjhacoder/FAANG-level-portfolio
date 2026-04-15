import connectDB from "@/shared/lib/db";
import { verifyEmailUseCase } from "@/modules/auth/application/useCases/verifyEmail.usecase";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import logger from "@/shared/lib/logger";
import { ValidationError } from "@/shared/errors";

const handler = withRateLimit(
  async (req) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new ValidationError("Verification token is required");
    }

    const userRepository = new UserRepository();

    const result = await verifyEmailUseCase(
      { userRepository, logger },
      { token },
    );

    return Response.json(result);
  },
  { limit: 10, window: 60, prefix: "verify-email" },
);

export async function GET(req) {
  try {
    return await handler(req);
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 400 },
    );
  }
}
