import { ProjectSectionModel } from "./projectSection.schema.js";

export class ProjectSectionRepository {
  async findByProfileId(profileId) {
    return ProjectSectionModel.findOne({ profileId });
  }

  async upsert(profileId, payload, userId) {
    return ProjectSectionModel.findOneAndUpdate(
      { profileId },
      {
        $set: {
          ...payload,
          profileId,
        },
        $setOnInsert: {
          createdBy: userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
  }
}
