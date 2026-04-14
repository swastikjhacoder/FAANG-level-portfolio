import { ExperienceModel } from "./experience.schema.js";

export class ExperienceRepository {
  async findById(experienceId) {
    return ExperienceModel.findOne({
      _id: experienceId,
      isDeleted: false,
    }).lean();
  }

  async update(experienceId, update, userId) {
    return ExperienceModel.findOneAndUpdate(
      { _id: experienceId, isDeleted: false },
      {
        ...update,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).lean();
  }

  async softDelete(experienceId) {
    return ExperienceModel.findOneAndUpdate(
      { _id: experienceId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }

  async findByProfile(profileId) {
    return ExperienceModel.find({
      profileId,
      isDeleted: false,
    })
      .sort({ startDate: -1 })
      .lean();
  }
}
