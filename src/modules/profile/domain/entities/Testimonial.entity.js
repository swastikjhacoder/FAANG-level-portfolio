export class Testimonial {
  constructor({
    profileId,
    quote,
    senderName,
    senderRole,
    company,
    approved = false,
  }) {
    this.profileId = profileId;
    this.quote = quote;
    this.senderName = senderName;
    this.senderRole = senderRole;
    this.company = company;
    this.approved = approved;
  }

  validate() {
    if (!this.quote || this.quote.length < 5) {
      throw new Error("Invalid testimonial");
    }
  }

  approve() {
    this.approved = true;
  }
}
