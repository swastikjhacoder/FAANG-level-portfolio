import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError, NotFoundError } from "@/shared/errors";

const toDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

export class UpdateCertificationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id, payload, user) {
    validateObjectId(id, "certificationId");

    if (!payload || !payload.content || !Object.keys(payload.content).length) {
      throw new ValidationError("No valid fields to update");
    }

    const content = {};

    if (payload.content.certificationName !== undefined) {
      content.certificationName = payload.content.certificationName;
    }

    if (payload.content.organization !== undefined) {
      content.organization = payload.content.organization;
    }

    if (payload.content.issueDate !== undefined) {
      const parsed = toDate(payload.content.issueDate);
      if (parsed !== undefined) {
        content.issueDate = parsed;
      }
    }

    if (payload.content.expiryDate !== undefined) {
      const parsed = toDate(payload.content.expiryDate);
      if (parsed !== undefined) {
        content.expiryDate = parsed;
      }
    }

    if (payload.content.credentialId !== undefined) {
      content.credentialId = payload.content.credentialId;
    }

    if (payload.content.credentialUrl !== undefined) {
      content.credentialUrl = payload.content.credentialUrl;
    }

    if (payload.content.description !== undefined) {
      content.description = payload.content.description;
    }

    if (!Object.keys(content).length) {
      throw new ValidationError("No valid fields to update");
    }

    const updated = await this.repo.update(id, { content }, user.id);

    if (!updated) {
      throw new NotFoundError("Certification not found");
    }

    return updated;
  }
}
