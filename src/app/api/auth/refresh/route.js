import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db";
import { cookies } from "next/headers";
import { RefreshTokenUseCase } from "@/modules/auth/application/useCases/refreshToken.usecase";
import { extractRequestMeta } from "@/shared/utils/requestMeta";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    console.log("REFRESH COOKIE:", cookieStore.get("refreshToken"));

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

    cookieStore.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    return NextResponse.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Token refresh failed",
      },
      { status: 401 },
    );
  }
}
