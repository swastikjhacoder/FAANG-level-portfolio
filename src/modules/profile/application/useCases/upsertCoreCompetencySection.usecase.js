import { ValidationError } from "@/shared/errors";
import { coreCompetencySectionDTO } from "../dto/coreCompetencySection.dto";

export class UpsertCoreCompetencySectionUseCase {
  constructor(repo, cache) {
    this.repo = repo;
    this.cache = cache;
  }

  async execute(payload, userId, version) {
    const parsed = coreCompetencySectionDTO.parse(payload);

    const result = await this.repo.upsert(
      {
        ...parsed,
        createdBy: userId,
        updatedBy: userId,
      },
      version,
    );

    if (!result) {
      throw new ValidationError(
        "Concurrent update detected. Please refresh and retry.",
      );
    }

    if (this.cache) {
      await this.cache.invalidate("coreCompetencySection");
    }

    return result;
  }
}
