import { CompetencyModel } from "./coreCompetency.schema.js";

export class CoreCompetencyRepository {
  async upsert(profileId, items, version) {
    try {
      const query = {
        profileId,
        isDeleted: false,
        ...(version !== undefined ? { version } : {}),
      };

      const update = {
        $set: { items },
        ...(version !== undefined && { $inc: { version: 1 } }),
        $setOnInsert: {
          profileId,
        },
      };

      return await CompetencyModel.findOneAndUpdate(query, update, {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }).lean();
    } catch (err) {
      if (err.code === 11000) {
        if (version === undefined) {
          return CompetencyModel.findOne({
            profileId,
            isDeleted: false,
          }).lean();
        }
        return null;
      }
      throw err;
    }
  }

  async findByProfile(profileId) {
    return CompetencyModel.findOne({
      profileId,
      isDeleted: false,
    }).lean();
  }

  async softDelete(profileId) {
    return CompetencyModel.findOneAndUpdate(
      { profileId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { returnDocument: "after" },
    ).lean();
  }
}
