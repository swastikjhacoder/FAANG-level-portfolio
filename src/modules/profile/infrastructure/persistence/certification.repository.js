import { CertificationModel } from "./certification.schema";

export class CertificationRepository {
  async create(data, userId) {
    const [doc] = await CertificationModel.create([
      {
        profileId: data.profileId,
        content: data.content,
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
      .sort({ "content.issueDate": -1 })
      .lean();
  }

  async findById(id) {
    return CertificationModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
  }

  async update(id, data, userId) {
    const updateFields = {};

    if (data.content) {
      for (const key in data.content) {
        if (data.content[key] !== undefined) {
          updateFields[`content.${key}`] = data.content[key];
        }
      }
    }

    return CertificationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: {
          ...updateFields,
          updatedBy: userId,
          updatedAt: new Date(),
        },
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
