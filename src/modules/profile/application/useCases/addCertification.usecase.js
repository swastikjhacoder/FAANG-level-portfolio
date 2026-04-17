import { validateObjectId } from "@/shared/utils/validateObjectId";

const toDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

export class AddCertificationUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    validateObjectId(payload.profileId, "profileId");

    const transformed = {
      profileId: payload.profileId,
      content: {
        certificationName: payload.content.certificationName,
        organization: payload.content.organization,

        issueDate: payload.content.issueDate
          ? toDate(payload.content.issueDate)
          : undefined,

        expiryDate: payload.content.expiryDate
          ? toDate(payload.content.expiryDate)
          : undefined,

        credentialId: payload.content.credentialId,
        credentialUrl: payload.content.credentialUrl,

        certificateDownloadUrl:
          payload.content.certificateDownloadUrl || undefined,
        certificatePublicId: payload.content.certificatePublicId || undefined,

        description: payload.content.description,
      },
    };

    return this.repo.create(transformed, user.id);
  }
}
