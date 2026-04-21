import { ValidationError } from "@/shared/errors";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class AddProjectSectionDTO {
  constructor({ profileId, heading, subHeading, description }) {
    this.profileId = profileId;
    this.heading = heading;
    this.subHeading = subHeading;
    this.description = description;
  }

  static validate(payload) {
    const { profileId, heading, subHeading, description } = payload;

    if (!profileId) {
      throw new ValidationError("profileId is required");
    }
    validateObjectId(profileId, "profileId");

    if (!heading || heading.trim().length === 0) {
      throw new ValidationError("heading is required");
    }

    if (heading.length > 150) {
      throw new ValidationError("heading must be <= 150 characters");
    }

    if (subHeading && subHeading.length > 150) {
      throw new ValidationError("subHeading must be <= 150 characters");
    }

    if (description && description.length > 150) {
      throw new ValidationError("description must be <= 150 characters");
    }

    return new AddProjectSectionDTO({
      profileId,
      heading: heading.trim(),
      subHeading: subHeading?.trim() || null,
      description: description?.trim() || null,
    });
  }
}
