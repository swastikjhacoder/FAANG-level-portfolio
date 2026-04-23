import { ProjectSectionModel } from "./projectSection.schema.js";

const SINGLETON_KEY = "PROJECT_SECTION";

export class ProjectSectionRepository {
  async get() {
    return ProjectSectionModel.findOne({
      singleton: SINGLETON_KEY,
    }).lean();
  }

  async upsert(payload, userId) {
    const doc = await ProjectSectionModel.findOneAndUpdate(
      { singleton: SINGLETON_KEY },
      {
        $set: {
          ...payload,
          updatedBy: userId,
        },
        $setOnInsert: {
          createdBy: userId,
          singleton: SINGLETON_KEY,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return doc?.toObject();
  }

  async delete() {
    return ProjectSectionModel.deleteOne({
      singleton: SINGLETON_KEY,
    });
  }
}