import { validateObjectId } from "@/shared/utils/validateObjectId";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { ProfilePolicy } from "../../domain/policies/profile.policy";
import auditLogger from "@/shared/security/audit/audit.logger";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { coreCompetencyItemDTO } from "../dto/addCoreCompetency.dto";

export class AddCoreCompetencyItemUseCase {
  constructor(repo, profileRepo, cache) {
    this.repo = repo;
    this.profileRepo = profileRepo;
    this.cache = cache;
  }

  async execute(payload, user) {
    const cleanPayload = sanitizeInput(payload);

    const { profileId, ...rest } = cleanPayload;

    validateObjectId(profileId, "profileId");

    const item = coreCompetencyItemDTO.parse(rest);

    const profile = await this.profileRepo.findById(profileId);
    if (!profile) throw new NotFoundError("Profile not found");

    ProfilePolicy.assertCanModifyProfile(user, profile);

    const existing = await this.repo.findByProfile(profileId);
    if (!existing) {
      throw new NotFoundError("Competency section not found");
    }

    if (existing.data.length >= 20) {
      throw new ValidationError("Maximum 20 competency items allowed");
    }

    const normalizedTitle = item.title.trim().toLowerCase();

    if (
      existing.data?.some(
        (i) => i.title.trim().toLowerCase() === normalizedTitle,
      )
    ) {
      const existingItem = existing.data.find(
        (i) => i.title.trim().toLowerCase() === normalizedTitle,
      );

      if (existingItem) {
        const result = await this.repo.updateItem(
          profileId,
          existingItem._id,
          item,
          user.id,
          existing.version,
        );

        if (!result) {
          throw new ValidationError("Concurrent update detected, please retry");
        }

        return result;
      }
    }

    const result = await this.repo.addItem(
      profileId,
      { ...item, updatedAt: new Date() },
      user.id,
      existing.version,
    );

    if (!result) {
      auditLogger.warn("COMPETENCY_CONFLICT", {
        profileId,
        userId: user.id,
        version: existing.version,
      });

      throw new ValidationError("Concurrent update detected, please retry");
    }

    auditLogger.info("COMPETENCY_ITEM_ADDED", {
      actor: { userId: user.id, roles: user.roles },
      resource: { type: "CoreCompetency", profileId },
      changes: { added: item },
      meta: { requestId: user.requestId },
    });

    if (this.cache) {
      await this.cache.invalidate(profileId);
    }

    return result;
  }
}
