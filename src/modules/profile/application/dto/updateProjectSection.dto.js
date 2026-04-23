import { ValidationError } from "@/shared/errors";

export class UpdateProjectSectionDTO {
  static validate(payload) {
    const { heading, subHeading, description } = payload;

    if (
      heading === undefined &&
      subHeading === undefined &&
      description === undefined
    ) {
      throw new ValidationError("At least one field must be provided");
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

    return updates;
  }
}
