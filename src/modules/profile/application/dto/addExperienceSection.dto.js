export class AddExperienceSectionDTO {
  constructor(data) {
    this.heading = data.heading;
    this.subHeading = data.subHeading;
    this.description = data.description;
  }

  validate() {
    if (!this.heading) {
      throw new Error("heading is required");
    }
  }
}
