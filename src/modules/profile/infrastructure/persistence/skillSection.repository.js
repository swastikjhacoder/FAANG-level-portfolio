import { SkillSectionModel } from "./skillSection.schema";

export class SkillSectionRepository {
  async upsert(data, userId) {
    return SkillSectionModel.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          ...data,
          updatedBy: userId,
          key: "global",
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

  async get() {
    return SkillSectionModel.findOne({ key: "global" }).lean();
  }

  async delete() {
    return SkillSectionModel.findOneAndDelete({ key: "global" });
  }
}
