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
    await this.repo.assertOwnership(profileId, user.id);
    const data = updateProfileDTO.parse(payload);
    const entity = {};

    if (data.name) entity.name = data.name;
    if (data.roles) entity.roles = data.roles;
    if (data.description) entity.description = data.description;
    if (data.profileImage) entity.profileImage = data.profileImage;
    if (data.dateOfBirth) entity.dateOfBirth = data.dateOfBirth;
    if (data.maritalStatus) entity.maritalStatus = data.maritalStatus;
    if (data.languages) entity.languages = data.languages;

    const persistence = toPersistenceUpdate(entity, user.id);
    return this.repo.update(profileId, persistence, { session });
  }
}
