export class CoreCompetency {
  constructor({ profileId, heading, description, icon }) {
    this.profileId = profileId;
    this.heading = heading;
    this.description = description;
    this.icon = icon;
  }

  validate() {
    if (!this.heading || !this.description) {
      throw new Error("Invalid competency");
    }
  }
}
