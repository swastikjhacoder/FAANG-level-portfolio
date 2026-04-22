import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { ProfilePolicy } from "../../domain/policies/profile.policy";
import auditLogger from "@/shared/security/audit/audit.logger";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { coreCompetencyItemDTO } from "../dto/addCoreCompetency.dto";

export class UpsertCoreCompetencyUseCase {
  constructor(repo, profileRepo, cache) {
    this.repo = repo;
    this.profileRepo = profileRepo;
    this.cache = cache;
  }

  async execute(payload, user) {
    const cleanPayload = sanitizeInput(payload);

    const { profileId, items } = cleanPayload;

    validateObjectId(profileId, "profileId");

    const parsed = coreCompetencyItemDTO.parse({ profileId, items });

    const profile = await this.profileRepo.findById(profileId);
    if (!profile) throw new NotFoundError("Profile not found");

    ProfilePolicy.assertCanModifyProfile(user, profile);

    const existing = await this.repo.findByProfile(profileId);

    const version = existing?.version;

    const normalizedItems = parsed.items.map((item) =>
      item.trim().replace(/\s+/g, " "),
    );

    if (
      existing &&
      JSON.stringify(existing.items) === JSON.stringify(normalizedItems)
    ) {
      return existing;
    }

    const result = await this.repo.upsert(profileId, normalizedItems, version);

    if (!result) {
      throw new ValidationError(
        "Concurrent update detected. Please refresh and retry.",
      );
    }

    auditLogger.log({
      action: "COMPETENCY_UPDATED",
      userId: user.userId,
      resourceId: profileId,
      metadata: {
        items: normalizedItems,
      },
    });

    if (this.cache) {
      await this.cache.invalidate(profileId);
    }

    return result;
  }
}
