import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { EmailService } from "@/modules/auth/infrastructure/communication/email.service";
import { ForgotPasswordUseCase } from "@/modules/auth/application/useCases/forgotPassword.usecase";
import connectDB from "@/shared/lib/db";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    const usecase = new ForgotPasswordUseCase({
      userRepository: new UserRepository(),
      mailService: new EmailService(),
    });

    await usecase.execute({ email });

    return Response.json({
      message: "If email exists, reset link sent",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);

    return Response.json({ message: "Something went wrong" }, { status: 500 });
  }
}
