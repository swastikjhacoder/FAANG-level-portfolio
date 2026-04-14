import mongoose from "mongoose";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { ProfileReadRepository } from "../../infrastructure/persistence/profile.read.repository.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";

import { cloudinaryService } from "../../infrastructure/services/cloudinary.service.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";

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

  async handleProfileImage(newFile, oldImage) {
    if (
      !newFile ||
      typeof newFile !== "object" ||
      typeof newFile.arrayBuffer !== "function"
    ) {
      return oldImage;
    }

    if (!newFile.name || !newFile.type) {
      throw new ValidationError("Invalid file object");
    }

    if (newFile.size > 5 * 1024 * 1024) {
      throw new ValidationError("File too large");
    }

    const file = await this.toUploadFile(newFile);

    const uploaded = await cloudinaryService.upload(file, "profile");

    if (oldImage?.publicId) {
      await cloudinaryService.delete(
        oldImage.publicId,
        oldImage.resourceType || "image",
      );
    }

    return uploaded;
  }

  async toUploadFile(file) {
    const buffer = Buffer.from(await file.arrayBuffer());

    return {
      buffer,
      size: file.size,
      mimetype: file.type,
      originalname: file.name,
    };
  }

  async getProfile(profileId) {
    const cached = await this.cache.get(profileId);
    if (cached) return cached;

    const data = await this.readRepo.getFullProfile(profileId);

    if (!data) {
      throw new NotFoundError("Profile not found");
    }

    await this.cache.set(profileId, data);

    return data;
  }

  async listProfiles({ page, limit }) {
    return this.repo.list({ page, limit });
  }

  async createProfile(data, user) {
    this.validateAdmin(user);

    const profileImage = await this.handleProfileImage(data.profileImage, null);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const profile = await this.repo.create(
        {
          ...data,
          profileImage,
          createdBy: user.id,
          updatedBy: user.id,
        },
        { session },
      );

      await session.commitTransaction();
      await this.cache.set(profile._id.toString(), profile);

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

    const existing = await this.repo.findById(profileId);

    if (!existing || existing.isDeleted) {
      throw new NotFoundError("Profile not found");
    }

    const profileImage = await this.handleProfileImage(
      data.profileImage,
      existing.profileImage,
    );

    const updated = await this.repo.update(profileId, {
      ...data,
      profileImage,
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    await this.cache.invalidate(profileId);

    return updated;
  }

  async deleteProfile(profileId, user) {
    this.validateAdmin(user);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existing = await this.repo.findById(profileId);

      if (!existing || existing.isDeleted) {
        throw new NotFoundError("Profile not found");
      }

      await this.repo.softDelete(profileId, { session });

      await this.cache.invalidate(profileId);

      if (existing.profileImage?.publicId) {
        await cloudinaryService.delete(
          existing.profileImage.publicId,
          existing.profileImage.resourceType || "image",
        );
      }

      await session.commitTransaction();

      return true;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
