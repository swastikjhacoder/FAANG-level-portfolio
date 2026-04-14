import { TestimonialModel } from "../../infrastructure/persistence/testimonial.schema.js";

export class ApproveTestimonialUseCase {
  async execute(testimonialId, user, { session } = {}) {
    return TestimonialModel.findOneAndUpdate(
      { _id: testimonialId, isDeleted: false },
      {
        approved: true,
        updatedBy: user.id,
      },
      {
        new: true,
        session,
      },
    );
  }
}
