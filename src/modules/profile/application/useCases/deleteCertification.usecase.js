import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError } from "@/shared/errors";

export class DeleteCertificationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    validateObjectId(id, "certificationId");

    const deleted = await this.repo.softDelete(id);

    if (!deleted) {
      throw new NotFoundError("Certification not found");
    }

    return true;
  }
}
