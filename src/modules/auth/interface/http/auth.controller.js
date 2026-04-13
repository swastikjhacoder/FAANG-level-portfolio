import connectDB from "@/shared/lib/db";
import { cookies } from "next/headers";

import { LoginUseCase } from "../../application/useCases/login.usecase";
import { RegisterUseCase } from "../../application/useCases/register.usecase";
import { RefreshTokenUseCase } from "../../application/useCases/refreshToken.usecase";

import { extractRequestMeta } from "@/shared/utils/requestMeta";
import { EmailService } from "@/modules/auth/infrastructure/communication/email.service";

const COOKIE_NAME = "refreshToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const loginController = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new LoginUseCase();

    const result = await useCase.execute(body, {
      ip,
      userAgent,
    });

    const response = Response.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      sessionId: result.sessionId,
    });

    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${result.refreshToken}; Path=/; HttpOnly; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      } SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
    );

    return response;
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("STACK TRACE:", error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Login failed",
      }),
      { status: 401 },
    );
  }
};

export const registerController = async (req) => {
  try {
    const body = await req.json();

    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new RegisterUseCase();

    const result = await useCase.execute(body, { ip, userAgent });

    const emailService = new EmailService();

    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${result.verificationToken}`;

    await emailService.sendVerificationEmail(result.user.email, verifyUrl);

    return Response.json({
      success: true,
      user: result.user,
      message: "Verification email sent",
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Registration failed",
      }),
      { status: 400 },
    );
  }
};

export const refreshController = async (req) => {
  try {
    await connectDB();
    
    const cookieStore = cookies();

    const refreshToken = cookieStore.get(COOKIE_NAME)?.value;

    if (!refreshToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new RefreshTokenUseCase();

    const result = await useCase.execute(refreshToken, {
      ip,
      userAgent,
    });

    cookieStore.set(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

    return Response.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Token refresh failed",
      }),
      { status: 401 },
    );
  }
};

export const logoutController = async () => {
  try {
    const cookieStore = cookies();

    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return Response.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Logout failed",
      }),
      { status: 500 },
    );
  }
};
