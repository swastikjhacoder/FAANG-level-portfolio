import { addExperienceDTO } from "../dto/addExperience.dto.js";
import { toExperienceEntity } from "../mapper/profile.mapper.js";
import { ExperienceModel } from "../../infrastructure/persistence/experience.schema.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddExperienceUseCase {
  constructor() {
    this.profileRepo = new ProfileRepository();
    this.cache = new ProfileCache();
  }

  async execute(payload, user, { session } = {}) {
    const data = addExperienceDTO.parse(payload);

    validateObjectId(data.profileId, "profileId");

    await this.profileRepo.assertOwnership(data.profileId, user.id);

    const entity = toExperienceEntity(data);
    entity.validate();

    const [doc] = await ExperienceModel.create(
      [
        {
          profileId: entity.profileId,
          company: entity.company,
          role: entity.role,
          startDate: entity.startDate,
          endDate: entity.endDate,
          history: entity.history,
          achievements: entity.achievements,
          projects: entity.projects,
          createdBy: user.id,
          updatedBy: user.id,
        },
      ],
      { session },
    );

    await this.cache.invalidate(entity.profileId);

    return doc.toObject();
  }
}
