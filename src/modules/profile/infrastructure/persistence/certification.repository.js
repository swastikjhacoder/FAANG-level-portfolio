import { CertificationModel } from "./certification.schema.js";

export class CertificationRepository {
  async create(data, userId) {
    const [doc] = await CertificationModel.create([
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return CertificationModel.find({
      profileId,
      isDeleted: false,
    })
      .sort({ startDate: -1 })
      .lean();
  }

  async update(id, data, userId) {
    return CertificationModel.findOneAndUpdate(
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
    return CertificationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
