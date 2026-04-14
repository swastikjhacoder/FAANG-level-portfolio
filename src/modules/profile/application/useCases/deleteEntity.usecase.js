import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";

export class DeleteEntityUseCase {
  constructor() {
    this.repo = new ProfileRepository();
  }

  async execute(profileId, user, { session } = {}) {
    return this.repo.softDelete(profileId, { session });
  }
}
