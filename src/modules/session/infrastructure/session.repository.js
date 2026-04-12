import mongoose from "mongoose";
import SessionModel from "./session.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class SessionRepository {
  async create(sessionData) {
    const safeData = sanitizeMongoQuery({
      userId: new mongoose.Types.ObjectId(sessionData.userId),
      refreshTokenHash: sessionData.refreshTokenHash,
      userAgent: sessionData.userAgent,
      ip: sessionData.ip,
      fingerprint: sessionData.fingerprint,
      expiresAt: sessionData.expiresAt,
      rotatedFrom: sessionData.rotatedFrom
        ? new mongoose.Types.ObjectId(sessionData.rotatedFrom)
        : undefined,
    });

    const session = await SessionModel.create(safeData);
    return session.toObject();
  }

  async findByTokenHash(hash) {
    const safeQuery = sanitizeMongoQuery({
      refreshTokenHash: hash,
    });

    return SessionModel.findOne(safeQuery)
      .select(
        "+refreshTokenHash userId isRevoked expiresAt rotatedFrom fingerprint",
      )
      .lean();
  }

  async findById(sessionId) {
    const safeId = new mongoose.Types.ObjectId(sessionId);

    return SessionModel.findById(safeId).lean();
  }

  async rotateSession(oldSessionId, newSessionData) {
    const session = await this.create({
      ...newSessionData,
      rotatedFrom: oldSessionId,
    });

    await this.revokeSession(oldSessionId);

    return session;
  }

  async revokeSession(sessionId) {
    const safeId = new mongoose.Types.ObjectId(sessionId);

    return SessionModel.updateOne(
      { _id: safeId },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      },
    );
  }

  async revokeAllUserSessions(userId) {
    const safeUserId = new mongoose.Types.ObjectId(userId);

    return SessionModel.updateMany(
      { userId: safeUserId },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      },
    );
  }

  async updateLastUsed(sessionId) {
    const safeId = new mongoose.Types.ObjectId(sessionId);

    return SessionModel.updateOne(
      { _id: safeId },
      {
        $set: {
          lastUsedAt: new Date(),
        },
      },
    );
  }

  async deleteExpiredSessions() {
    return SessionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  async findActiveSessionsByUser(userId) {
    const safeUserId = new mongoose.Types.ObjectId(userId);

    return SessionModel.find({
      userId: safeUserId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select("userAgent ip fingerprint createdAt lastUsedAt")
      .lean();
  }

  async findSessionChain(sessionId) {
    const chain = [];

    let current = await this.findById(sessionId);

    while (current) {
      chain.push(current);

      if (!current.rotatedFrom) break;

      current = await this.findById(current.rotatedFrom);
    }

    return chain;
  }

  async detectReuse(session) {
    if (!session) return false;

    if (session.isRevoked) {
      await this.revokeAllUserSessions(session.userId);
      return true;
    }

    return false;
  }
}
