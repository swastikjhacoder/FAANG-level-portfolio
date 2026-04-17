import mongoose from "mongoose";
import UserModel from "./user.schema";
import { sanitizeMongoQuery } from "@/shared/security/sanitizers/mongo.sanitizer";

export class UserRepository {
  async findByEmail(email, { includePassword = false } = {}) {
    const safeQuery = sanitizeMongoQuery({
      email: email.trim().toLowerCase(),
    });

    const projection = includePassword
      ? "+passwordHash email roles name userImage isLocked isVerified failedLoginAttempts sessionVersion"
      : "email roles name userImage isLocked isVerified failedLoginAttempts sessionVersion";

    return UserModel.findOne(safeQuery).select(projection).lean();
  }

  async findById(userId, { includeSensitive = false } = {}) {
    const safeId = new mongoose.Types.ObjectId(userId);

    let query = UserModel.findById(safeId);

    if (includeSensitive) {
      query = query.select("+passwordHash +mfaSecret");
    }

    return query.lean();
  }

  async findOne(filter) {
    const safeQuery = sanitizeMongoQuery(filter);
    return UserModel.findOne(safeQuery).lean();
  }

  async findByVerificationToken(tokenHash) {
    const safeQuery = sanitizeMongoQuery({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    return UserModel.findOne(safeQuery).lean();
  }

  async updateUserImage(userId, imageData) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      {
        $set: {
          userImage: imageData,
        },
      },
    );
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
      userImage: userData.userImage || null,
      roles: userData.roles || ["USER"],
      isVerified: false,
      emailVerificationToken: userData.emailVerificationToken,
      emailVerificationExpires: userData.emailVerificationExpires,
      failedLoginAttempts: 0,
      isLocked: false,
      mfaEnabled: false,
      sessionVersion: 0,
      createdByIp: userData.createdByIp,
      lastLoginIp: userData.lastLoginIp,
    };

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

  async updateById(userId, update) {
    const safeId = new mongoose.Types.ObjectId(userId);
    const safeUpdate = sanitizeMongoQuery(update);

    return UserModel.updateOne({ _id: safeId }, { $set: safeUpdate });
  }

  async count() {
    return UserModel.countDocuments();
  }

  async exists() {
    const result = await UserModel.exists({});
    return !!result;
  }

  async existsByEmail(email) {
    const safeQuery = sanitizeMongoQuery({
      email: email.trim().toLowerCase(),
    });

    const result = await UserModel.exists(safeQuery);
    return !!result;
  }

  async incrementFailedAttempts(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.findByIdAndUpdate(
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

  async resetPassword(userId, passwordHash) {
    const safeId = new mongoose.Types.ObjectId(userId);

    return UserModel.updateOne(
      { _id: safeId },
      {
        $set: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpiry: null,
          passwordChangedAt: new Date(),
        },
        $inc: { sessionVersion: 1 },
      },
    );
  }

  async delete(userId) {
    const safeId = new mongoose.Types.ObjectId(userId);
    return UserModel.deleteOne({ _id: safeId });
  }
}
