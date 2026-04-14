export class Profile {
  constructor({
    id,
    name,
    roles,
    description,
    profileImage,
    dateOfBirth,
    maritalStatus,
    languages = [],
  }) {
    this.id = id;
    this.name = name;
    this.roles = roles;
    this.description = description;
    this.profileImage = profileImage;
    this.dateOfBirth = dateOfBirth;
    this.maritalStatus = maritalStatus;
    this.languages = languages;
  }

  validate() {
    if (!this.name?.first || !this.name?.last) {
      throw new Error("Invalid name");
    }
    if (!Array.isArray(this.roles) || this.roles.length === 0) {
      throw new Error("Roles required");
    }
  }
}
