import connectDB from "@/shared/lib/db";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { EmailService } from "@/modules/auth/infrastructure/communication/email.service";
import { ResendVerificationUseCase } from "@/modules/auth/application/useCases/resendVerification.usecase";
import logger from "@/shared/lib/logger";

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { email } = body;

  const userRepository = new UserRepository();
  const emailService = new EmailService();

  const useCase = new ResendVerificationUseCase({
    userRepository,
    emailService,
    logger,
  });

  try {
    const result = await useCase.execute({ email });

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 400 },
    );
  }
}
