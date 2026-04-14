export class ProfileSummary {
  constructor({ profileId, items = [] }) {
    this.profileId = profileId;
    this.items = items;
  }

  validate() {
    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error("Summary cannot be empty");
    }
  }
}
