export class Skill {
  constructor({ profileId, name, experience, proficiency, icon }) {
    this.profileId = profileId;
    this.name = name;
    this.experience = experience;
    this.proficiency = proficiency;
    this.icon = icon;
  }

  validate() {
    if (!this.name) throw new Error("Skill name required");
    if (this.proficiency < 0 || this.proficiency > 10) {
      throw new Error("Invalid proficiency");
    }
  }
}
