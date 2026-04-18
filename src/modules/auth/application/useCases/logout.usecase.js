import { SessionRepository } from "../../infrastructure/persistence/session.repository";
import auditLogger from "@/shared/security/audit/audit.logger";

export class LogoutUseCase {
  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async execute(params = {}, context = {}) {
    const { sessionId, userId, logoutAll = false } = params;
    const { ip, userAgent } = context;

    if (logoutAll) {
      if (!userId) {
        throw new Error("User ID required for global logout");
      }

      await this.sessionRepository.revokeAllSessions(userId);

      await auditLogger.log({
        action: "LOGOUT_ALL",
        userId,
        ip,
        userAgent,
      });

      return { success: true };
    }

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      return { success: true };
    }

    await this.sessionRepository.revokeSession(sessionId);

    await auditLogger.log({
      action: "LOGOUT",
      userId: session.userId,
      sessionId,
      ip,
      userAgent,
    });

    return { success: true };
  }
}
