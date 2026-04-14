import { addSkillDTO } from "../dto/addSkill.dto.js";
import {
  toSkillEntity,
  toPersistenceProfile,
} from "../mapper/profile.mapper.js";
import { SkillModel } from "../../infrastructure/persistence/skill.schema.js";

export class AddSkillUseCase {
  async execute(payload, user, { session } = {}) {
    const data = addSkillDTO.parse(payload);
    const entity = toSkillEntity(data);

    const [doc] = await SkillModel.create(
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
