import mongoose from "mongoose";
import { ProfileModel } from "./profile.schema.js";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ForbiddenError, ValidationError } from "@/shared/errors";
import connectDB from "@/shared/lib/db.js";

export class ProfileRepository {
  allowedUpdateFields = [
    "name",
    "roles",
    "description",
    "profileImage",
    "dateOfBirth",
    "maritalStatus",
    "languages",
  ];

  async ensureDB() {
    await connectDB();
  }

  baseQuery() {
    return { isDeleted: false };
  }

  filterUpdate(data) {
    const filtered = {};

    for (const key of this.allowedUpdateFields) {
      if (
        Object.prototype.hasOwnProperty.call(data, key) &&
        data[key] !== undefined
      ) {
        filtered[key] = data[key];
      }
    }

    return filtered;
  }

  async create(data, { session } = {}) {
    const [profile] = await ProfileModel.create([data], { session });
    return profile.toObject();
  }

  async findById(profileId) {
    validateObjectId(profileId, "profileId");

    return ProfileModel.findOne({
      _id: profileId,
      ...this.baseQuery(),
    }).lean();
  }

  async findByUserId(userId) {
    if (!userId) return null;

    return await ProfileModel.findOne({
      userId,
      ...this.baseQuery(),
    }).lean();
  }

  async exists(profileId) {
    validateObjectId(profileId, "profileId");

    return ProfileModel.exists({
      _id: profileId,
      ...this.baseQuery(),
    });
  }

  async findLatestActive() {
    await this.ensureDB();
    return ProfileModel.findOne(this.baseQuery())
      .sort({ createdAt: -1 })
      .lean();
  }

  async findPublicProfile() {
    return ProfileModel.findOne({
      ...this.baseQuery(),
      profileImage: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async list({
    page = 1,
    limit = 10,
    filters = {},
    sort = { createdAt: -1 },
  } = {}) {
    page = Math.max(1, page);
    limit = Math.min(limit, 50);

    const query = {
      ...this.baseQuery(),
    };

    if (filters.roles) {
      query.roles = { $in: filters.roles };
    }

    if (filters.language) {
      query.languages = filters.language;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProfileModel.find(query).sort(sort).skip(skip).limit(limit).lean(),

      ProfileModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(profileId, data, { session } = {}) {
    validateObjectId(profileId, "profileId");

    const updateData = this.filterUpdate(data);

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    return ProfileModel.findOneAndUpdate(
      {
        _id: profileId,
        ...this.baseQuery(),
      },
      {
        ...updateData,
        updatedAt: new Date(),
        updatedBy: data.updatedBy,
      },
      {
        new: true,
        session,
        runValidators: true,
      },
    ).lean();
  }

  async softDelete(profileId, { session } = {}) {
    validateObjectId(profileId, "profileId");

    return ProfileModel.findOneAndUpdate(
      {
        _id: profileId,
        ...this.baseQuery(),
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
        session,
      },
    ).lean();
  }

  async restore(profileId, { session } = {}) {
    validateObjectId(profileId, "profileId");

    return ProfileModel.findOneAndUpdate(
      {
        _id: profileId,
        isDeleted: true,
      },
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        new: true,
        session,
      },
    ).lean();
  }

  async hardDelete(profileId, { session } = {}) {
    validateObjectId(profileId, "profileId");

    return ProfileModel.deleteOne(
      {
        _id: profileId,
        isDeleted: true,
      },
      { session },
    );
  }

  async assertOwnership(profileId, userId) {
    validateObjectId(profileId, "profileId");

    const exists = await ProfileModel.exists({
      _id: profileId,
      userId: userId,
      ...this.baseQuery(),
    });

    if (!exists) {
      throw new ForbiddenError("You do not own this profile");
    }
  }

  async bulkCreate(profiles, { session } = {}) {
    return ProfileModel.insertMany(profiles, { session });
  }

  async withTransaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
