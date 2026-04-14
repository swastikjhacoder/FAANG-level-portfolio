import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteEducationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    validateObjectId(id, "educationId");

    const deleted = await this.repo.softDelete(id);

    if (!deleted) {
      throw new NotFoundError("Education not found");
    }

    return true;
  }
}
