import { CoreCompetencySectionModel } from "./coreCompetencySection.schema.js";

export class CoreCompetencySectionRepository {
  async get() {
    return CoreCompetencySectionModel.findOne({
      isDeleted: false,
    }).lean();
  }

  async upsert(data, version) {
    return CoreCompetencySectionModel.findOneAndUpdate(
      {
        isDeleted: false,
        ...(version !== undefined ? { version } : {}),
      },
      {
        $set: {
          heading: data.heading,
          subHeading: data.subHeading,
          description: data.description,
          updatedBy: data.updatedBy,
        },

        $setOnInsert: {
          createdBy: data.createdBy,
        },

        $inc: { version: 1 },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();
  }

  async softDelete() {
    return CoreCompetencySectionModel.findOneAndUpdate(
      { isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
