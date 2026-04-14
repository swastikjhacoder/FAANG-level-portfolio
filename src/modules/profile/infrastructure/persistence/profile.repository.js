import mongoose from "mongoose";
import { ProfileModel } from "./profile.schema.js";

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

  filterUpdate(data) {
    const filtered = {};
    for (const key of this.allowedUpdateFields) {
      if (data[key] !== undefined) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  async create(data, { session } = {}) {
    const [profile] = await ProfileModel.create([data], { session });
    return profile;
  }

  async findById(profileId) {
    return ProfileModel.findOne({
      _id: profileId,
      isDeleted: false,
    }).lean();
  }

  async update(profileId, data, { session } = {}) {
    const updateData = this.filterUpdate(data);

    return ProfileModel.findOneAndUpdate(
      {
        _id: profileId,
        isDeleted: false,
      },
      {
        ...updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        session,
        runValidators: true,
      },
    ).lean();
  }

  async softDelete(profileId, { session } = {}) {
    return ProfileModel.findOneAndUpdate(
      { _id: profileId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
        session,
      },
    );
  }

  async restore(profileId, { session } = {}) {
    return ProfileModel.findOneAndUpdate(
      { _id: profileId, isDeleted: true },
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        new: true,
        session,
      },
    );
  }

  async hardDelete(profileId, { session } = {}) {
    return ProfileModel.deleteOne({ _id: profileId }, { session });
  }

  async exists(profileId) {
    return ProfileModel.exists({
      _id: profileId,
      isDeleted: false,
    });
  }

  async list({
    page = 1,
    limit = 10,
    filters = {},
    sort = { createdAt: -1 },
  } = {}) {
    const query = {
      isDeleted: false,
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
