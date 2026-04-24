import { softSkillSectionSchema } from "../dto/softSkillSection.dto";
import { ValidationError } from "@/shared/errors";
import { SoftSkillSection } from "../../domain/entities/SoftSkillSection.entity";

export class UpsertSoftSkillSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload) {
    const parsed = softSkillSectionSchema.safeParse(payload);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors);
    }

    const entity = new SoftSkillSection(parsed.data);

    return this.repo.upsert({
      heading: entity.heading,
      subHeading: entity.subHeading,
      description: entity.description,
    });
  }
}
