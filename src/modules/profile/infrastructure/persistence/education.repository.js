import { EducationModel } from "./education.schema.js";

export class EducationRepository {
  async create(data, userId) {
    const [doc] = await EducationModel.create([
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return EducationModel.find({
      profileId,
      isDeleted: false,
    })
      .sort({ startDate: -1 })
      .lean();
  }

  async update(id, data, userId) {
    return EducationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).lean();
  }

  async softDelete(id) {
    return EducationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
