export class Service {
  constructor({ profileId, heading, icon, subheading, description }) {
    this.profileId = profileId;
    this.heading = heading;
    this.icon = icon;
    this.subheading = subheading;
    this.description = description;
  }

  validate() {
    if (!this.heading) throw new Error("Service heading required");
  }
}
