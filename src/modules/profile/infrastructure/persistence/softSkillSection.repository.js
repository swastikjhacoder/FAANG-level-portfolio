import SoftSkillSection from "./softSkillSection.schema";

const GLOBAL_KEY = "GLOBAL_SOFT_SKILL_SECTION";

export class SoftSkillSectionRepository {
  async upsert(data) {
    return SoftSkillSection.findOneAndUpdate(
      { key: GLOBAL_KEY },
      { ...data, key: GLOBAL_KEY },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();
  }

  async get() {
    return SoftSkillSection.findOne({ key: GLOBAL_KEY }).lean();
  }

  async delete() {
    return SoftSkillSection.deleteOne({ key: GLOBAL_KEY });
  }
}
