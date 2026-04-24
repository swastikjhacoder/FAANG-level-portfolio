export class SoftSkillSection {
  constructor({ id, heading, subHeading, description }) {
    if (!heading || !heading.trim()) {
      throw new Error("Heading is required");
    }

    this.id = id;
    this.heading = heading.trim();
    this.subHeading = subHeading?.trim() || "";
    this.description = description?.trim() || "";
  }

  update({ heading, subHeading, description }) {
    if (heading !== undefined) {
      if (!heading.trim()) {
        throw new Error("Heading cannot be empty");
      }
      this.heading = heading.trim();
    }

    if (subHeading !== undefined) {
      this.subHeading = subHeading.trim();
    }

    if (description !== undefined) {
      this.description = description.trim();
    }
  }
}
