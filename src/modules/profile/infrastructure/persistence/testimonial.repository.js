import { TestimonialModel } from "./testimonial.schema.js";

export class TestimonialRepository {
  async create(data, userId) {
    const [doc] = await TestimonialModel.create([
      {
        ...data,
        approved: false,
        createdBy: userId || null,
      },
    ]);

    return doc.toObject();
  }

  async findApprovedByProfile(profileId) {
    return TestimonialModel.find({
      profileId,
      approved: true,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findAllByProfile(profileId) {
    return TestimonialModel.find({
      profileId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async approve(id, userId) {
    return TestimonialModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        approved: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true },
    ).lean();
  }

  async softDelete(id) {
    return TestimonialModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();
  }
}
