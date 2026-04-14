import { ContactModel } from "./contact.schema.js";

export class ContactRepository {
  async create(data, userId) {
    const [doc] = await ContactModel.create([
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return ContactModel.findOne({
      profileId,
      isDeleted: false,
    }).lean();
  }
  
  async findById(id) {
    return ContactModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
  }

  async update(id, data, userId) {
    return ContactModel.findOneAndUpdate(
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
    return ContactModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
