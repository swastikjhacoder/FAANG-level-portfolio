import mongoose from "mongoose";
import SessionModel from "./session.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class SessionRepository {
  async create(sessionData) {
    const safeData = {
      userId: new mongoose.Types.ObjectId(sessionData.userId),

      currentTokenHash: sessionData.currentTokenHash,
      previousTokenHash: sessionData.previousTokenHash || null,

      fingerprint: sessionData.fingerprint,
      userAgent: sessionData.userAgent,
      ip: sessionData.ip,

      sessionVersion: sessionData.sessionVersion || 0,

      isRevoked: sessionData.isRevoked ?? false,
      expiresAt: sessionData.expiresAt,
    };

    const session = await SessionModel.create(safeData);
    return session.toObject();
  }

  async findByTokenHash(hash) {
    const safeQuery = sanitizeMongoQuery({
      currentTokenHash: hash,
    });

    return SessionModel.findOne(safeQuery)
      .select(
        "+currentTokenHash +previousTokenHash userId isRevoked expiresAt fingerprint sessionVersion",
      )
      .lean();
  }

  async findById(sessionId) {
    const safeId = new mongoose.Types.ObjectId(sessionId);

    return SessionModel.findById(safeId)
      .select("-currentTokenHash -previousTokenHash")
      .lean();
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
