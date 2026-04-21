import { UnauthorizedError, ValidationError } from "@/shared/errors";

export class UpsertAcademicSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    if (!user || !user.userId) {
      throw new UnauthorizedError("Unauthorized access");
    }

    if (!payload || typeof payload !== "object") {
      throw new ValidationError("Invalid payload");
    }

    const { heading, subHeading, description } = payload;

    if (!heading || typeof heading !== "string") {
      throw new ValidationError("Heading is required");
    }

    const result = await this.repo.upsert(
      {
        heading: heading.trim(),
        subHeading: subHeading?.trim(),
        description: description?.trim(),
      },
      user.userId,
    );

    return result;
  }
}

export class GetAcademicSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute() {
    const data = await this.repo.get();

    if (!data) {
      return {
        heading: "",
        subHeading: "",
        description: "",
      };
    }

    return data;
  }
}

export class DeleteAcademicSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(user) {
    if (!user || !user.userId) {
      throw new UnauthorizedError("Unauthorized access");
    }

    const result = await this.repo.delete();

    return result;
  }
}
