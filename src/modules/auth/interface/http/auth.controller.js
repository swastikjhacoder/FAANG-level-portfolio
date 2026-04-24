import connectDB from "@/shared/lib/db";
import { cookies } from "next/headers";

import { LoginUseCase } from "../../application/useCases/login.usecase";
import { RegisterUseCase } from "../../application/useCases/register.usecase";
import { RefreshTokenUseCase } from "../../application/useCases/refreshToken.usecase";

import { extractRequestMeta } from "@/shared/utils/requestMeta";
import { EmailService } from "@/modules/auth/infrastructure/communication/email.service";
import { RegisterDTO } from "../../application/dto/register.dto";
import auditLogger from "@/shared/security/audit/audit.logger";
import { NextResponse } from "next/server";

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const loginController = async (req, context = {}) => {
  try {
    await connectDB();

    const body = context.body || (await req.json());
    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new LoginUseCase();

    const result = await useCase.execute(body, {
      ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    };

    response.cookies.set("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Login failed",
      },
      { status: 401 },
    );
  }
};

export const registerController = async (req, context = {}) => {
  try {
    await connectDB();

    const body = context.body || (await req.json());

    const dto = new RegisterDTO({
      email: body.email,
      password: body.password,
      firstName: String(body.firstName || body.name?.firstName || "").trim(),
      lastName: String(body.lastName || body.name?.lastName || "").trim(),
    });

    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new RegisterUseCase();

    const result = await useCase.execute(dto, {
      ip,
      userAgent,
      file: context.file,
    });

    const emailService = new EmailService();
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${result.verificationToken}`;

    emailService
      .sendVerificationEmail(result.user.email, verifyUrl)
      .catch((err) => {
        auditLogger.log({
          action: "EMAIL_SEND_FAILED",
          email: result.user.email,
          error: err.message,
        });
      });

    return jsonResponse({
      success: true,
      user: result.user,
      message: "Verification email sent",
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: error.message || "Registration failed",
      },
      400,
    );
  }
};

export const refreshController = async (req) => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new RefreshTokenUseCase();

    const result = await useCase.execute(refreshToken, {
      ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      accessToken: result.accessToken,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    };

    response.cookies.set("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Token refresh failed",
      },
      { status: 401 },
    );
  }
};