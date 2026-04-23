import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError, UnauthorizedError } from "@/shared/errors";

export class AddEducationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    if (!user?.userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    validateObjectId(payload.profileId, "profileId");

    const data = {
      profileId: payload.profileId,
      institution: payload.institution.trim(),
      boardOrUniversity: payload.boardOrUniversity?.trim() || null,
      degree: payload.degree.trim(),
      fieldOfStudy: payload.fieldOfStudy?.trim() || null,
      specializations: payload.specializations || [],

      startDate: new Date(payload.startDate),
      endDate: payload.endDate ? new Date(payload.endDate) : null,

      grade: payload.grade?.trim() || null,
      description: payload.description?.trim() || null,
    };

    return this.repo.create(data, user.userId);
  }
}
