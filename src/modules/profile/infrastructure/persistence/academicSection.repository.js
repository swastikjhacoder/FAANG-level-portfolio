import { AcademicSectionModel } from "./academicSection.schema";

export class AcademicSectionRepository {
  async get() {
    return AcademicSectionModel.findOne();
  }

  async upsert(payload, userId) {
    return AcademicSectionModel.findOneAndUpdate(
      {},
      {
        ...payload,
        updatedBy: userId,
        $setOnInsert: { createdBy: userId },
      },
      { new: true, upsert: true },
    );
  }

  async delete() {
    return AcademicSectionModel.deleteOne({});
  }
}
