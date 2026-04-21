import { ValidationError } from "@/shared/errors";
import { validateObjectId } from "@/shared/utils/validateObjectId";

export class UpdateProjectSectionDTO {
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

    if (
      heading === undefined &&
      subHeading === undefined &&
      description === undefined
    ) {
      throw new ValidationError(
        "At least one field (heading, subHeading, description) must be provided",
      );
    }

    const updates = {};

    if (heading !== undefined) {
      if (!heading || heading.trim().length === 0) {
        throw new ValidationError("heading cannot be empty");
      }
      if (heading.length > 150) {
        throw new ValidationError("heading must be <= 150 characters");
      }
      updates.heading = heading.trim();
    }

    if (subHeading !== undefined) {
      if (subHeading && subHeading.length > 150) {
        throw new ValidationError("subHeading must be <= 150 characters");
      }
      updates.subHeading = subHeading?.trim() || null;
    }

    if (description !== undefined) {
      if (description && description.length > 150) {
        throw new ValidationError("description must be <= 150 characters");
      }
      updates.description = description?.trim() || null;
    }

    return new UpdateProjectSectionDTO({
      profileId,
      ...updates,
    });
  }
}
