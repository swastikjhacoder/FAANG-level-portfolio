import { addExperienceDTO } from "../dto/addExperience.dto.js";
import { toExperienceEntity } from "../mapper/profile.mapper.js";
import { ExperienceModel } from "../../infrastructure/persistence/experience.schema.js";

export class AddExperienceUseCase {
  async execute(payload, user, { session } = {}) {
    const data = addExperienceDTO.parse(payload);
    const entity = toExperienceEntity(data);

    const [doc] = await ExperienceModel.create(
      [
        {
          ...entity,
          createdBy: user.id,
          updatedBy: user.id,
        },
      ],
      { session },
    );

    return doc;
  }
}
