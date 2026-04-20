export class About {
  constructor({
    id,
    heading,
    subHeading,
    description,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.heading = heading;
    this.subHeading = subHeading;
    this.description = description;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  validate() {
    if (!this.heading || this.heading.length < 3) {
      throw new Error("Heading must be at least 3 characters long");
    }

    if (this.heading.length > 120) {
      throw new Error("Heading exceeds maximum length");
    }

    if (this.subHeading && this.subHeading.length > 200) {
      throw new Error("SubHeading exceeds maximum length");
    }

    if (!this.description || this.description.length < 10) {
      throw new Error("Description must be at least 10 characters long");
    }

    if (this.description.length > 3000) {
      throw new Error("Description exceeds maximum length");
    }
  }

  update({ heading, subHeading, description, updatedBy }) {
    if (heading !== undefined) this.heading = heading;
    if (subHeading !== undefined) this.subHeading = subHeading;
    if (description !== undefined) this.description = description;
    if (updatedBy) this.updatedBy = updatedBy;

    this.updatedAt = new Date();

    this.validate();
  }
}
