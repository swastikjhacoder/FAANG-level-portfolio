import { CreateUserUseCase } from "../../application/useCases/createUser.usecase";

export const createUserController = async (req) => {
  try {
    const body = req.validatedBody || (await req.json());

    const useCase = new CreateUserUseCase();

    const result = await useCase.execute(body);

    return Response.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "User creation failed",
      }),
      { status: 400 },
    );
  }
};
