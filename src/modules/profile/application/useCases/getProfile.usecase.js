import { ProfileReadRepository } from "../../infrastructure/persistence/profile.read.repository.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class GetProfileUseCase {
  constructor() {
    this.readRepo = new ProfileReadRepository();
  }

  async execute(profileId) {
    validateObjectId(profileId, "profileId");

    return this.readRepo.getFullProfile(profileId);
  }
}
