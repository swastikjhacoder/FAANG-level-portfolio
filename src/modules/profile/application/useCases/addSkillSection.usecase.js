import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddSkillSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    validateObjectId(payload.profileId, "profileId");

    return this.repo.upsert(payload.profileId, payload, user.id);
  }
}