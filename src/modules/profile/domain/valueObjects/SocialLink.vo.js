export class SocialLink {
  constructor({ name, url, icon }) {
    if (!name) {
      throw new Error("Social name required");
    }

    if (!this.isValidUrl(url)) {
      throw new Error("Invalid social URL");
    }

    this.name = name;
    this.url = url;
    this.icon = icon || null;
  }

  isValidUrl(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
