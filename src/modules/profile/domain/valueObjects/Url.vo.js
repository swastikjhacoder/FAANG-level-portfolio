export class Url {
  constructor(value) {
    if (!this.isValidUrl(value)) {
      throw new Error("Invalid URL");
    }
    this.value = value;
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
