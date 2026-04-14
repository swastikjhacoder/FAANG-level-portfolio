export class TestimonialPolicy {
  static canCreate(user) {
    return !!user;
  }

  static canApprove(user) {
    return (
      user &&
      Array.isArray(user.roles) &&
      user.roles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r))
    );
  }

  static canView(testimonial) {
    return testimonial && testimonial.approved === true;
  }

  static assertCreate(user) {
    if (!this.canCreate(user)) {
      throw new Error("Unauthorized");
    }
  }

  static assertApprove(user) {
    if (!this.canApprove(user)) {
      throw new Error("Forbidden");
    }
  }
}
