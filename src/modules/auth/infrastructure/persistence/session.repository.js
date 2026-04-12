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
      .select("+refreshTokenHash userId isRevoked expiresAt rotatedFrom")
      .lean();
  }

  async findById(sessionId) {
    const safeId = new mongoose.Types.ObjectId(sessionId);

    return SessionModel.findById(safeId).lean();
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
      .select("userAgent ip createdAt lastUsedAt")
      .lean();
  }
}
