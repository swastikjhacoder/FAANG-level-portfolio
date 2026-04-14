import { addProjectDTO } from "../dto/addProject.dto.js";
import { toProjectEntity } from "../mapper/profile.mapper.js";
import { ProjectModel } from "../../infrastructure/persistence/project.schema.js";

export class AddProjectUseCase {
  async execute(payload, user, { session } = {}) {
    const data = addProjectDTO.parse(payload);
    const entity = toProjectEntity(data);

    const [doc] = await ProjectModel.create(
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
