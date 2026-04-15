import { validateObjectId } from "@/shared/utils/validateObjectId";
import { coreCompetencySectionDTO } from "../dto/addCoreCompetency.dto";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { ProfilePolicy } from "../../domain/policies/profile.policy";
import { NotFoundError } from "@/shared/errors";

export class UpsertCoreCompetencySectionUseCase {
  constructor(repo, profileRepo) {
    this.repo = repo;
    this.profileRepo = profileRepo;
  }

  async execute(payload, user) {
    const cleanPayload = sanitizeInput(payload);

    const data = coreCompetencySectionDTO.parse(cleanPayload);

    validateObjectId(data.profileId, "profileId");

    const profile = await this.profileRepo.findById(data.profileId);
    if (!profile) throw new NotFoundError("Profile not found");

    ProfilePolicy.assertCanModifyProfile(user, profile);

    return await this.repo.upsert(data.profileId, data, user.id);
  }
}
