import { createProfileDTO } from "../dto/createProfile.dto.js";
import {
  toProfileEntity,
  toPersistenceProfile,
} from "../mapper/profile.mapper.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { SkillModel } from "../../infrastructure/persistence/skill.schema.js";
import { ExperienceModel } from "../../infrastructure/persistence/experience.schema.js";
import { ProjectModel } from "../../infrastructure/persistence/project.schema.js";

export class CreateProfileUseCase {
  constructor() {
    this.repo = new ProfileRepository();
  }

  async execute(payload, user) {
    const data = createProfileDTO.parse(payload);
    const entity = toProfileEntity(data);
    const persistence = toPersistenceProfile(entity, user.id);

    return this.repo.withTransaction(async (session) => {
      const profile = await this.repo.create(persistence, { session });

      if (data.skills?.length) {
        await SkillModel.insertMany(
          data.skills.map((s) => ({
            ...s,
            profileId: profile._id,
            createdBy: user.id,
            updatedBy: user.id,
          })),
          { session },
        );
      }

      if (data.experiences?.length) {
        await ExperienceModel.insertMany(
          data.experiences.map((e) => ({
            ...e,
            profileId: profile._id,
            createdBy: user.id,
            updatedBy: user.id,
          })),
          { session },
        );
      }

      if (data.projects?.length) {
        await ProjectModel.insertMany(
          data.projects.map((p) => ({
            ...p,
            profileId: profile._id,
            createdBy: user.id,
            updatedBy: user.id,
          })),
          { session },
        );
      }

      return profile;
    });
  }
}
