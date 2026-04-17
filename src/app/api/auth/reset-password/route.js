import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { ResetPasswordUseCase } from "@/modules/auth/application/useCases/resetPassword.usecase";
import connectDB from "@/shared/lib/db";

export async function POST(req) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    const usecase = new ResetPasswordUseCase({
      userRepository: new UserRepository(),
    });

    await usecase.execute({ token, password });

    return Response.json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    return Response.json(
      { message: err.message || "Something went wrong" },
      { status: 400 },
    );
  }
}
