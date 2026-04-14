import { updateProfileDTO } from "../dto/updateProfile.dto.js";
import {
  toProfileEntity,
  toPersistenceUpdate,
} from "../mapper/profile.mapper.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";

export class UpdateProfileUseCase {
  constructor() {
    this.repo = new ProfileRepository();
  }

  async execute(profileId, payload, user, { session } = {}) {
    const data = updateProfileDTO.parse(payload);
    const entity = toProfileEntity({
      ...data,
      name: data.name || undefined,
    });
    const persistence = toPersistenceUpdate(entity, user.id);
    return this.repo.update(profileId, persistence, { session });
  }
}
