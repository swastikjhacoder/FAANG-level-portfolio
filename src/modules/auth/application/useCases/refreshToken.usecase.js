import { UnauthorizedError } from "@/shared/errors";

import SessionModel from "@/modules/auth/infrastructure/persistence/session.schema";
import UserModel from "@/modules/auth/infrastructure/persistence/user.schema";

import { signAccessToken } from "@/shared/utils/jwt";

import { generateTokenWithMeta, hashToken } from "@/shared/utils/hash";

export class RefreshTokenUseCase {
  async execute(refreshToken, { ip, userAgent }) {
    const tokenHash = hashToken(refreshToken);

    const session = await SessionModel.findOne({
      $or: [{ currentTokenHash: tokenHash }, { previousTokenHash: tokenHash }],
    }).select("+currentTokenHash +previousTokenHash");

    if (!session) throw new UnauthorizedError("Invalid session");
    if (session.isRevoked) throw new UnauthorizedError("Session revoked");
    if (session.expiresAt < new Date())
      throw new UnauthorizedError("Session expired");

    const isValid =
      tokenHash === session.currentTokenHash ||
      tokenHash === session.previousTokenHash;

    if (!isValid) throw new UnauthorizedError("Invalid token");

    if (session.fingerprint !== `${userAgent}-${ip}`) {
      console.warn("⚠️ Fingerprint mismatch");
    }

    const user = await UserModel.findById(session.userId);
    if (!user) throw new UnauthorizedError("User not found");

    const { raw: newRefreshToken, hash: newTokenHash } =
      generateTokenWithMeta();

    session.previousTokenHash = session.currentTokenHash;
    session.currentTokenHash = newTokenHash;
    session.lastUsedAt = new Date();

    await session.save();

    const accessToken = signAccessToken({
      userId: user._id,
      roles: user.roles,
      sessionVersion: session.sessionVersion,
      sessionId: session._id.toString(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}