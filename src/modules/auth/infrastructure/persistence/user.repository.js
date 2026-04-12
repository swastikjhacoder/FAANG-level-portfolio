import mongoose from "mongoose";
import UserModel from "./user.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class UserRepository {
  async findByEmail(email, { includePassword = false } = {}) {
    const safeQuery = sanitizeMongoQuery({
      email: email.trim().toLowerCase(),
    });

    const projection = includePassword
      ? "+passwordHash email roles name isLocked isVerified failedLoginAttempts sessionVersion"
      : "email roles name isLocked isVerified failedLoginAttempts sessionVersion";

    return await UserModel.findOne(safeQuery).select(projection).lean();
  }

  async create(userData) {
    const safeData = {
      email: userData.email,
      passwordHash: userData.passwordHash,

      name: {
        firstName: userData.name.firstName,
        lastName: userData.name.lastName,
        displayName: userData.name.displayName,
      },

      roles: ["USER"],
      isVerified: false,

      failedLoginAttempts: 0,
      isLocked: false,

      mfaEnabled: false,
      sessionVersion: 0,

      createdByIp: userData.createdByIp,
      lastLoginIp: userData.lastLoginIp,
    };

    try {
      const user = await UserModel.create(sanitizeMongoQuery(safeData));
      return user.toObject();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("User already exists");
      }
      throw err;
    }
  }

  async incrementFailedAttempts(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return await UserModel.findByIdAndUpdate(
      safeId,
      { $inc: { failedLoginAttempts: 1 } },
      {
        new: true,
        projection: { failedLoginAttempts: 1 },
      },
    ).lean();
  }

  async resetFailedAttempts(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return await UserModel.updateOne(
      { _id: safeId },
      { $set: { failedLoginAttempts: 0 } },
    );
  }

  async lockAccount(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return await UserModel.updateOne(
      { _id: safeId },
      { $set: { isLocked: true } },
    );
  }

  async updateLoginMetadata(userId, data) {
    const safeId = new mongoose.Types.ObjectId(userId);

    const safeUpdate = {
      lastLoginAt: data.lastLoginAt,
      lastLoginIp: data.lastLoginIp,
    };

    return await UserModel.updateOne({ _id: safeId }, { $set: safeUpdate });
  }
}
