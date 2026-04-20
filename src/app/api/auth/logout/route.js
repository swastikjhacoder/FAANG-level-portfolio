import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import auditLogger from "@/shared/security/audit/audit.logger";

import { SessionRepository } from "@/modules/auth/infrastructure/persistence/session.repository";

import crypto from "crypto";

const DEV = process.env.NODE_ENV === "development";

const sessionRepo = new SessionRepository();

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getCookieFromRequest = (req, name) => {
  const cookieHeader = req.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      }),
  );

  return cookies[name];
};

const logoutHandler = async (req) => {
  try {
    await connectDB();

    const userId = req.user?.userId;

    const refreshToken = getCookieFromRequest(req, "refreshToken");

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);

      const session = await sessionRepo.findByTokenHash(tokenHash);

      if (session && !session.isRevoked) {
        await sessionRepo.revokeSession(session._id);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: !DEV,
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    };

    response.cookies.set("accessToken", "", cookieOptions);
    response.cookies.set("refreshToken", "", cookieOptions);

    response.cookies.set("csrfToken", "", {
      ...cookieOptions,
      httpOnly: false,
    });

    auditLogger.log({
      action: "LOGOUT",
      userId,
      metadata: {
        revokedSession: !!refreshToken,
      },
    });

    return response;
  } catch (error) {
    console.error("🔥 LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Logout failed",
      },
      { status: 500 },
    );
  }
};

const logout = withRateLimit(
  withCsrf(authGuard(logoutHandler)),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

export async function POST(req) {
  return logout(req);
}
