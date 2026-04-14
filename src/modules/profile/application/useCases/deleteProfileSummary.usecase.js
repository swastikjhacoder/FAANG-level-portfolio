import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteProfileSummaryUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    validateObjectId(id, "summaryId");

    const deleted = await this.repo.softDelete(id);

    if (!deleted) {
      throw new NotFoundError("Summary not found");
    }

    return true;
  }
}
