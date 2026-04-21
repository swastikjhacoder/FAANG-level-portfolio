import { EducationModel } from "./education.schema.js";
import mongoose from "mongoose";

export class EducationRepository {
  async create(data, userId) {
    const doc = await EducationModel.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    return doc.toObject();
  }

  async findByProfile(profileId) {
    return EducationModel.find({
      profileId: new mongoose.Types.ObjectId(profileId),
      isDeleted: false,
    })
      .sort({ startDate: -1 })
      .lean();
  }

  async findById(id) {
    return EducationModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
  }

  async update(id, data, userId) {
    const updated = await EducationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return updated ? updated.toObject() : null;
  }

  async softDelete(id, userId) {
    const deleted = await EducationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
      },
      { new: true },
    );

    return deleted ? deleted.toObject() : null;
  }

  async deletePermanent(id) {
    return EducationModel.findByIdAndDelete(id);
  }
}
