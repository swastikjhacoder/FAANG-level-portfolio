import { createProfileDTO } from "../dto/createProfile.dto.js";
import {
  toProfileEntity,
  toPersistenceProfile,
} from "../mapper/profile.mapper.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";

export class CreateProfileUseCase {
  constructor() {
    this.repo = new ProfileRepository();
  }

  async execute(payload, user, { session } = {}) {
    const data = createProfileDTO.parse(payload);
    const entity = toProfileEntity(data);
    const persistence = toPersistenceProfile(entity, user.id);
    return this.repo.create(persistence, { session });
  }
}
