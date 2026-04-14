import mongoose from "mongoose";
import UserModel from "./user.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class UserRepository {
  async findByEmail(email, { includePassword = false } = {}) {
    const safeQuery = sanitizeMongoQuery({
      email: email.trim().toLowerCase(),
    });

    let query = UserModel.findOne(safeQuery);

    if (includePassword) {
      query = query.select("+passwordHash +mfaSecret");
    }

    return await query.lean({ getters: true });
  }

  async findById(userId, { includeSensitive = false } = {}) {
    const safeId = new mongoose.Types.ObjectId(userId);

    let query = UserModel.findById(safeId);

    if (includeSensitive) {
      query = query.select("+passwordHash +mfaSecret");
    }

    return await query.lean({ getters: true });
  }

  async create(userData) {
    const safeData = sanitizeMongoQuery(userData);

    try {
      const user = await UserModel.create(safeData);
      return user.toObject();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("User already exists");
      }
      throw err;
    }
  }

  async update(userId, data) {
    const safeId = new mongoose.Types.ObjectId(userId);
    const safeData = sanitizeMongoQuery(data);

    return UserModel.updateOne({ _id: safeId }, { $set: safeData });
  }

  async count() {
    return await UserModel.countDocuments();
  }

  async exists() {
    const result = await UserModel.exists({});
    return !!result;
  }

  async incrementFailedAttempts(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return await UserModel.findByIdAndUpdate(
      safeId,
      { $inc: { failedLoginAttempts: 1 } },
      { new: true, projection: { failedLoginAttempts: 1 } },
    ).lean();
  }

  async resetFailedAttempts(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      { $set: { failedLoginAttempts: 0 } },
    );
  }

  async lockAccount(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne({ _id: safeId }, { $set: { isLocked: true } });
  }

  async unlockAccount(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      {
        $set: {
          isLocked: false,
          failedLoginAttempts: 0,
        },
      },
    );
  }

  async updateLoginMetadata(userId, { lastLoginAt, lastLoginIp }) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      {
        $set: {
          lastLoginAt,
          lastLoginIp,
        },
      },
    );
  }

  async incrementSessionVersion(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      { $inc: { sessionVersion: 1 } },
    );
  }

  async updatePassword(userId, passwordHash) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      {
        $set: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
      },
    );
  }

  async existsByEmail(email) {
    const safeQuery = sanitizeMongoQuery({
      email: email.trim().toLowerCase(),
    });

    const result = await UserModel.exists(safeQuery);
    return !!result;
  }

  async delete(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.deleteOne({ _id: safeId });
  }
}
