import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class UpdateExperienceUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(experienceId, payload, user) {
    validateObjectId(experienceId, "experienceId");

    const update = {};

    if (payload.company) update.company = payload.company;
    if (payload.role) update.role = payload.role;
    if (payload.startDate) update.startDate = payload.startDate;
    if (payload.endDate !== undefined) update.endDate = payload.endDate;

    if (payload.history) update.history = payload.history;
    if (payload.achievements) update.achievements = payload.achievements;
    if (payload.projects) update.projects = payload.projects;

    if (Object.keys(update).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    const updated = await this.repo.update(experienceId, update, user.id);

    if (!updated) {
      throw new NotFoundError("Experience not found");
    }

    return updated;
  }
}
