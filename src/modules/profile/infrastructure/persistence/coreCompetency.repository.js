import { CompetencyModel } from "./coreCompetency.schema.js";

export class CoreCompetencyRepository {
  async upsert(profileId, data, userId) {
    return CompetencyModel.findOneAndUpdate(
      { profileId, isDeleted: false },
      {
        $set: {
          heading: data.heading,
          subHeading: data.subHeading,
          description: data.description,
          updatedBy: userId,
        },
        $setOnInsert: {
          profileId,
          createdBy: userId,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    ).lean();
  }

  async findByProfile(profileId) {
    return CompetencyModel.findOne({
      profileId,
      isDeleted: false,
    }).lean();
  }

  async addItem(profileId, item, userId, version) {
    return CompetencyModel.findOneAndUpdate(
      { profileId, version, isDeleted: false },
      {
        $push: { data: item },
        $inc: { version: 1 },
        $set: { updatedBy: userId },
      },
      {
        returnDocument: "after",
      },
    ).lean();
  }

  async updateItem(profileId, itemId, item, userId, version) {
    return CompetencyModel.findOneAndUpdate(
      {
        profileId,
        version,
        isDeleted: false,
        "data._id": itemId,
      },
      {
        $set: {
          "data.$.title": item.title,
          "data.$.description": item.description,
          "data.$.updatedAt": new Date(),
          updatedBy: userId,
        },
        $inc: { version: 1 },
      },
      {
        returnDocument: "after",
      },
    ).lean();
  }

  async updateSection(profileId, data, userId) {
    return CompetencyModel.findOneAndUpdate(
      { profileId, isDeleted: false },
      {
        $set: {
          ...data,
          updatedBy: userId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();
  }

  async softDelete(profileId) {
    return CompetencyModel.findOneAndUpdate(
      { profileId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
      },
    ).lean();
  }
}
