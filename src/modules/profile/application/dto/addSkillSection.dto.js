export class AddSkillSectionDTO {
  constructor({ profileId, heading, subHeading, description }) {
    this.profileId = profileId;
    this.heading = heading;
    this.subHeading = subHeading;
    this.description = description;
  }
}
