import mongoose from "mongoose";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { ProfileReadRepository } from "../../infrastructure/persistence/profile.read.repository.js";
import { ProfileModel } from "../../infrastructure/persistence/profile.schema.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { ForbiddenError } from "@/shared/errors/index.js";

export class ProfileService {
  constructor() {
    this.cache = new ProfileCache();
    this.readRepo = new ProfileReadRepository();
    this.repo = new ProfileRepository();
  }

  validateAdmin(user) {
    if (
      !user ||
      !Array.isArray(user.roles) ||
      !user.roles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r))
    ) {
      throw new ForbiddenError("Admin privileges required");
    }
  }

  async getProfile(profileId) {
    const cached = await this.cache.get(profileId);
    if (cached) return cached;

    const data = await this.readRepo.getFullProfile(profileId);

    if (data) {
      await this.cache.set(profileId, data);
    }

    return data;
  }

  async createProfile(data, user) {
    this.validateAdmin(user);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const profile = await this.repo.create(
        {
          ...data,
          createdBy: user.id,
          updatedBy: user.id,
        },
        { session },
      );

      await session.commitTransaction();

      return profile;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async updateProfile(profileId, data, user) {
    this.validateAdmin(user);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updated = await ProfileModel.findByIdAndUpdate(
        profileId,
        {
          ...data,
          updatedBy: user.id,
        },
        { new: true, session },
      ).lean();

      await this.cache.invalidate(profileId);

      await session.commitTransaction();

      return updated;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async deleteProfile(profileId, user) {
    this.validateAdmin(user);

    await ProfileModel.findByIdAndUpdate(profileId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    await this.cache.invalidate(profileId);
  }
}
