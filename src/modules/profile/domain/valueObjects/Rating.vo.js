export class Rating {
  constructor(value) {
    if (typeof value !== "number" || value < 0 || value > 10) {
      throw new Error("Rating must be between 0 and 10");
    }
    this.value = value;
  }
}
