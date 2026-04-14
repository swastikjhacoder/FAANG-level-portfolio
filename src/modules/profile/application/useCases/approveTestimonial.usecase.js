import { TestimonialModel } from "../../infrastructure/persistence/testimonial.schema.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class ApproveTestimonialUseCase {
  async execute(testimonialId, user, { session } = {}) {
    validateObjectId(testimonialId, "testimonialId");

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
    ).lean();
  }
}
