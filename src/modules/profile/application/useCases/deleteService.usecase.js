import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteServiceUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    validateObjectId(id, "serviceId");

    const deleted = await this.repo.softDelete(id);

    if (!deleted) {
      throw new NotFoundError("Service not found");
    }

    return true;
  }
}
