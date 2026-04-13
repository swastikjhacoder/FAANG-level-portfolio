import mongoose from "mongoose";
import SessionModel from "./session.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class SessionRepository {
  async create(sessionData) {
    const session = await SessionModel.create({
      userId: new mongoose.Types.ObjectId(sessionData.userId),
      currentTokenHash: sessionData.currentTokenHash,
      previousTokenHash: sessionData.previousTokenHash || null,
      fingerprint: sessionData.fingerprint,
      userAgent: sessionData.userAgent,
      ip: sessionData.ip,
      sessionVersion: sessionData.sessionVersion || 0,
      isRevoked: sessionData.isRevoked ?? false,
      expiresAt: sessionData.expiresAt,
    });

    return session.toObject();
  }

  async findByTokenHash(hash) {
    const safeQuery = sanitizeMongoQuery({
      $or: [{ currentTokenHash: hash }, { previousTokenHash: hash }],
    });

    return SessionModel.findOne(safeQuery).select(
      "+currentTokenHash +previousTokenHash userId isRevoked expiresAt fingerprint sessionVersion",
    );
  }

  async findById(sessionId) {
    return SessionModel.findById(new mongoose.Types.ObjectId(sessionId));
  }

  async updateTokenRotation(sessionId, update) {
    return SessionModel.updateOne(
      { _id: sessionId },
      {
        $set: {
          currentTokenHash: update.currentTokenHash,
          previousTokenHash: update.previousTokenHash,
          lastUsedAt: update.lastUsedAt,
        },
      },
    );
  }

  async revokeSession(sessionId) {
    return SessionModel.updateOne(
      { _id: new mongoose.Types.ObjectId(sessionId) },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      },
    );
  }

  async revokeAllUserSessions(userId) {
    return SessionModel.updateMany(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      },
    );
  }

  async deleteExpiredSessions() {
    return SessionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}
