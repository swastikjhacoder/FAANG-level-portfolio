export class DeleteProjectUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    return this.repo.delete(id);
  }
}
