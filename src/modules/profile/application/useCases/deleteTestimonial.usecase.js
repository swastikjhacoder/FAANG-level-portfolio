import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteTestimonialUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    validateObjectId(id, "testimonialId");

    const deleted = await this.repo.softDelete(id);

    if (!deleted) {
      throw new NotFoundError("Testimonial not found");
    }

    return true;
  }
}
