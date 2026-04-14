export class Experience {
  constructor({
    profileId,
    company,
    role,
    startDate,
    endDate,
    history = [],
    achievements = [],
    projects = [],
  }) {
    this.profileId = profileId;
    this.company = company;
    this.role = role;
    this.startDate = startDate;
    this.endDate = endDate;
    this.history = history;
    this.achievements = achievements;
    this.projects = projects;
  }

  validate() {
    if (!this.company || !this.role) {
      throw new Error("Invalid experience");
    }
    if (this.endDate && this.endDate < this.startDate) {
      throw new Error("Invalid date range");
    }
  }
}
