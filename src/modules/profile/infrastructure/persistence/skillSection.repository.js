import { SkillSectionModel } from "./skillSection.schema";

export class SkillSectionRepository {
  async upsert(profileId, data, userId) {
    return SkillSectionModel.findOneAndUpdate(
      { profileId },
      {
        ...data,
        createdBy: userId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
  }

  async findByProfileId(profileId) {
    return SkillSectionModel.findOne({ profileId });
  }
}