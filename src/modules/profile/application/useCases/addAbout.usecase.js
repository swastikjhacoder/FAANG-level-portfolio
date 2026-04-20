export class AddAboutUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const existing = await this.repo.get();

    if (existing) {
      return this.repo.update({
        ...payload,
        updatedBy: user.id,
      });
    }

    return this.repo.create({
      ...payload,
      createdBy: user.id,
    });
  }
}
