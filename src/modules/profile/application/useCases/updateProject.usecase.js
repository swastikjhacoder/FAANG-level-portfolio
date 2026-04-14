export class UpdateProjectUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id, data, user) {
    return this.repo.update(id, {
      ...data,
      updatedBy: user.id,
    });
  }
}
