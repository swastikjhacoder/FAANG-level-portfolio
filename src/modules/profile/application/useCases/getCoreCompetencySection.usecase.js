export class GetCoreCompetencySectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute() {
    return this.repo.get();
  }
}
