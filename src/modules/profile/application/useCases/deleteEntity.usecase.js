import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ForbiddenError } from "@/shared/errors";

export class DeleteEntityUseCase {
  constructor() {
    this.repo = new ProfileRepository();
  }

  async execute(profileId, user, { session } = {}) {
    validateObjectId(profileId, "profileId");

    if (!user?.id) {
      throw new ForbiddenError("Unauthorized");
    }

    await this.repo.assertOwnership(profileId, user.id);

    return this.repo.softDelete(profileId, { session });
  }
}
