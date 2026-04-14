import { addProjectDTO } from "../dto/addProject.dto.js";
import { toProjectEntity } from "../mapper/profile.mapper.js";
import { ProjectModel } from "../../infrastructure/persistence/project.schema.js";
import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";
import { ProfileCache } from "../../infrastructure/cache/profile.cache.js";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddProjectUseCase {
  constructor() {
    this.profileRepo = new ProfileRepository();
    this.cache = new ProfileCache();
  }

  async execute(payload, user, { session } = {}) {
    const data = addProjectDTO.parse(payload);

    validateObjectId(data.profileId, "profileId");

    await this.profileRepo.assertOwnership(data.profileId, user.id);

    const entity = toProjectEntity(data);
    entity.validate();

    const [doc] = await ProjectModel.create(
      [
        {
          profileId: entity.profileId,
          name: entity.name,
          liveUrl: entity.liveUrl,
          githubUrl: entity.githubUrl,
          techStack: entity.techStack,
          description: entity.description,
          screenshot: entity.screenshot,
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
