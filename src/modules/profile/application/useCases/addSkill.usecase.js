import { addSkillDTO } from "../dto/addSkill.dto.js";
import { toSkillEntity } from "../mapper/profile.mapper.js";
import { SkillModel } from "../../infrastructure/persistence/skill.schema.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { ConflictError, ValidationError } from "@/shared/errors";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddSkillUseCase {
  constructor() {
    this.profileRepo = new ProfileRepository();
    this.cache = new ProfileCache();
  }

  async execute(payload, user, { session } = {}) {
    const data = addSkillDTO.parse(payload);

    validateObjectId(data.profileId, "profileId");

    await this.profileRepo.assertOwnership(data.profileId, user.id);

    const entity = toSkillEntity(data);
    entity.validate();

    try {
      const [doc] = await SkillModel.create(
        [
          {
            profileId: entity.profileId,
            name: entity.name,
            experience: entity.experience,
            proficiency: entity.proficiency,
            icon: entity.icon || null,
            createdBy: user.id,
            updatedBy: user.id,
          },
        ],
        { session },
      );

      await this.cache.invalidate(entity.profileId);

      return doc.toObject();
    } catch (err) {
      if (err?.code === 11000) {
        if (err.keyPattern?.profileId && err.keyPattern?.name) {
          throw new ConflictError("Skill already exists for this profile");
        }
        throw new ConflictError("Duplicate resource");
      }

      if (err?.name === "ValidationError") {
        throw new ValidationError("Invalid skill data");
      }

      if (err?.name === "ZodError") {
        throw new ValidationError(err.errors?.[0]?.message);
      }

      throw err;
    }
  }
}
