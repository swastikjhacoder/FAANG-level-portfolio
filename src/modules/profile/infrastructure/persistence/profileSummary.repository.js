import { SummaryModel } from "./profileSummary.schema.js";

export class ProfileSummaryRepository {
  async create(data, userId) {
    const [doc] = await SummaryModel.create([
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return SummaryModel.find({
      profileId,
      isDeleted: false,
    }).lean();
  }

  async update(id, data, userId) {
    return SummaryModel.findOneAndUpdate(
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
    return SummaryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
