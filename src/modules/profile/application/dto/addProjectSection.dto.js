import { ValidationError } from "@/shared/errors";

export class AddProjectSectionDTO {
  constructor({ heading, subHeading, description }) {
    this.heading = heading;
    this.subHeading = subHeading;
    this.description = description;
  }

  static validate(payload) {
    const { heading, subHeading, description } = payload;

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
      heading: heading.trim(),
      subHeading: subHeading?.trim() || null,
      description: description?.trim() || null,
    });
  }
}
