import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddCertificationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    validateObjectId(payload.profileId, "profileId");

    return this.repo.create(payload, user.id);
  }
}
