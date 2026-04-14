import { ServiceModel } from "./service.schema.js";

export class ServiceRepository {
  async create(data, userId) {
    const [doc] = await ServiceModel.create([
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return ServiceModel.find({
      profileId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(id, data, userId) {
    return ServiceModel.findOneAndUpdate(
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
    return ServiceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
