export class Image {
  constructor({ url, publicId }) {
    if (!url || !this.isValidUrl(url)) {
      throw new Error("Invalid image URL");
    }
    if (!publicId) {
      throw new Error("Image publicId required");
    }

    this.url = url;
    this.publicId = publicId;
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
