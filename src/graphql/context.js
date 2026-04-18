import { verifyAccessToken } from "@/shared/utils/jwt";
import { UserRepository } from "@/modules/auth/infrastructure/persistence/user.repository";
import { SessionRepository } from "@/modules/auth/infrastructure/persistence/session.repository";

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();

export async function createContext({ request, response }) {
  let user = null;

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const ip = realIp || (forwarded ? forwarded.split(",")[0].trim() : null);
  const userAgent = request.headers.get("user-agent") || null;

  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      const decoded = verifyAccessToken(token);

      if (!decoded?.userId) throw new Error("Invalid token");

      user = await userRepo.findById(decoded.userId);

      if (!user || user.sessionVersion !== decoded.sessionVersion) {
        throw new Error("Session invalid");
      }

      if (decoded?.sessionId) {
        const session = await sessionRepo.findById(decoded.sessionId);

        if (
          !session ||
          session.isRevoked ||
          new Date() > new Date(session.expiresAt)
        ) {
          throw new Error("Session invalid");
        }

        await sessionRepo.updateLastUsed(decoded.sessionId);
      }
    }
  } catch {
    user = null;
  }

  return {
    req: request,
    res: response,
    user,
    isAuthenticated: !!user,
    ip,
    userAgent,
  };
}
