import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteExperienceUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(experienceId) {
    validateObjectId(experienceId, "experienceId");

    const deleted = await this.repo.softDelete(experienceId);

    if (!deleted) {
      throw new NotFoundError("Experience not found");
    }

    return true;
  }
}
