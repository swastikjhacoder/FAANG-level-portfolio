export class UpsertCertificationSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    return this.repo.upsert(payload, user.id);
  }
}
