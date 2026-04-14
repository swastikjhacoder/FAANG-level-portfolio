export class Certification {
  constructor({
    profileId,
    organization,
    certificationName,
    startDate,
    endDate,
  }) {
    this.profileId = profileId;
    this.organization = organization;
    this.certificationName = certificationName;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  validate() {
    if (!this.organization || !this.certificationName) {
      throw new Error("Invalid certification");
    }
  }
}
