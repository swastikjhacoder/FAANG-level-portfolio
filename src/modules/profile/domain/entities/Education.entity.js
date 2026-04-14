export class Education {
  constructor({
    profileId,
    institution,
    boardOrUniversity,
    degree,
    specializations = [],
    startDate,
    endDate,
  }) {
    this.profileId = profileId;
    this.institution = institution;
    this.boardOrUniversity = boardOrUniversity;
    this.degree = degree;
    this.specializations = specializations;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  validate() {
    if (!this.institution) {
      throw new Error("Institution required");
    }
  }
}
