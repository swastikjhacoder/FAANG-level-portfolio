import { ProfileReadRepository } from "../../infrastructure/persistence/profile.read.repository.js";

export class GetProfileUseCase {
  constructor() {
    this.readRepo = new ProfileReadRepository();
  }

  async execute(profileId) {
    return this.readRepo.getFullProfile(profileId);
  }
}
