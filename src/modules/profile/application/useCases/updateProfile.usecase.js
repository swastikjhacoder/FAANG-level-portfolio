import { updateProfileDTO } from "../dto/updateProfile.dto.js";
import { toPersistenceUpdate } from "../mapper/profile.mapper.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";

export class UpdateProfileUseCase {
  constructor() {
    this.repo = new ProfileRepository();
    this.cache = new ProfileCache();
  }

  async execute(profileId, payload, user, { session } = {}) {
    validateObjectId(profileId, "profileId");

    await this.repo.assertOwnership(profileId, user.id);

    const data = updateProfileDTO.parse(payload);

    const entity = {};

    if (data.name !== undefined) entity.name = data.name;
    if (data.roles !== undefined) entity.roles = data.roles;
    if (data.description !== undefined) entity.description = data.description;
    if (data.profileImage !== undefined)
      entity.profileImage = data.profileImage;
    if (data.dateOfBirth !== undefined) entity.dateOfBirth = data.dateOfBirth;
    if (data.maritalStatus !== undefined)
      entity.maritalStatus = data.maritalStatus;
    if (data.languages !== undefined) entity.languages = data.languages;

    if (Object.keys(entity).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    const persistence = toPersistenceUpdate(entity, user.id);

    const updated = await this.repo.update(profileId, persistence, {
      session,
    });

    await this.cache.invalidate(profileId);

    return updated;
  }
}
