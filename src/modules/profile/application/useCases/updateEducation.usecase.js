import { validateObjectId } from "@/shared/utils/validateObjectId";
import { UnauthorizedError } from "@/shared/errors";

export class UpdateEducationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id, payload, user) {
    if (!user?.userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    validateObjectId(id, "educationId");

    const data = {
      ...payload,
      ...(payload.startDate && {
        startDate: new Date(payload.startDate),
      }),
      ...(payload.endDate && {
        endDate: new Date(payload.endDate),
      }),
    };

    return this.repo.update(id, data, user.userId);
  }
}
