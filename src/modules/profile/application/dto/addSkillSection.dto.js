export class AddSkillSectionDTO {
  constructor({ heading, subHeading, description }) {
    if (!description || typeof description !== "string") {
      throw new Error("Description is required and must be a string");
    }

    if (heading && heading.length > 100) {
      throw new Error("Heading exceeds max length (100)");
    }

    if (subHeading && subHeading.length > 150) {
      throw new Error("SubHeading exceeds max length (150)");
    }

    if (description.length > 1000) {
      throw new Error("Description exceeds max length (1000)");
    }

    this.heading = heading?.trim();
    this.subHeading = subHeading?.trim();
    this.description = description.trim();
  }
}
