import mongoose from "mongoose";
import { addSoftSkillSchema } from "../dto/addSoftSkill.dto";
import { ValidationError } from "@/shared/errors";
import { SoftSkill } from "../../domain/entities/SoftSkill.entity";

export class UpsertSoftSkillUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload) {
    const parsed = addSoftSkillSchema.safeParse(payload);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors);
    }

    const { profileId, items } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      throw new ValidationError([
        { field: "profileId", message: "Invalid profileId" },
      ]);
    }

    const entity = new SoftSkill({
      profileId,
      items,
    });

    const objectId = new mongoose.Types.ObjectId(profileId);

    return this.repo.upsert(objectId, entity.items);
  }
}
