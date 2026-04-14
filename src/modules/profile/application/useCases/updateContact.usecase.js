import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class UpdateContactUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id, payload, user) {
    validateObjectId(id, "contactId");

    if (!Object.keys(payload).length) {
      throw new ValidationError("No valid fields to update");
    }

    const updated = await this.repo.update(id, payload, user.id);

    if (!updated) {
      throw new NotFoundError("Contact not found");
    }

    return updated;
  }
}
