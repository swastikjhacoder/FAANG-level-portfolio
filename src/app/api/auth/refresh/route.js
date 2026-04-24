import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db";
import { cookies } from "next/headers";
import { RefreshTokenUseCase } from "@/modules/auth/application/useCases/refreshToken.usecase";
import { extractRequestMeta } from "@/shared/utils/requestMeta";

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { ip, userAgent } = extractRequestMeta(req);

    const useCase = new RefreshTokenUseCase();
    const result = await useCase.execute(refreshToken, { ip, userAgent });

    const isProd = process.env.NODE_ENV === "production";

    const res = NextResponse.json({
      success: true,
      accessToken: result.accessToken,
    });

    res.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    res.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
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
