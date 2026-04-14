import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddServiceUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    validateObjectId(payload.profileId, "profileId");

    return this.repo.create(payload, user.id);
  }
}
