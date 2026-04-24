import SoftSkill from "./softSkill.schema";

export class SoftSkillRepository {
  async upsert(profileId, items) {
    return SoftSkill.findOneAndUpdate(
      { profileId },
      { items },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();
  }

  async findByProfile(profileId) {
    return SoftSkill.findOne({ profileId }).lean();
  }

  async deleteByProfile(profileId) {
    return SoftSkill.findOneAndDelete({ profileId });
  }
}
