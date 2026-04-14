export class Contact {
  constructor({ profileId, email, mobile, socials = [], address }) {
    this.profileId = profileId;
    this.email = email;
    this.mobile = mobile;
    this.socials = socials;
    this.address = address;
  }

  validate() {
    if (!this.email) throw new Error("Email required");
  }
}
