import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { cookies } from "next/headers";
import auditLogger from "@/shared/security/audit/audit.logger";

import { SessionRepository } from "@/modules/auth/infrastructure/persistence/session.repository";

import crypto from "crypto";

const DEV = process.env.NODE_ENV === "development";

const sessionRepo = new SessionRepository();

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const logoutHandler = async (req) => {
  try {
    await connectDB();

    const userId = req.user?.userId;

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

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
      secure: true,
      sameSite: "none",
      path: "/",
    };

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

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

const rateKey = (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`;

const logout = DEV
  ? withCsrf(logoutHandler)
  : withRateLimit(withCsrf(logoutHandler), {
      limit: 10,
      window: 60,
      key: rateKey,
    });

export async function POST(req) {
  return logout(req);
}
