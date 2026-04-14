export class DateRange {
  constructor({ startDate, endDate }) {
    if (!startDate) {
      throw new Error("Start date required");
    }

    this.startDate = new Date(startDate);
    this.endDate = endDate ? new Date(endDate) : null;

    if (this.endDate && this.endDate < this.startDate) {
      throw new Error("End date cannot be before start date");
    }
  }
}
