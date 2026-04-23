import { UpdateProjectSectionDTO } from "../dto/updateProjectSection.dto";

export class UpdateProjectSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    const updates = UpdateProjectSectionDTO.validate(payload);

    return this.repo.upsert(updates, user.id);
  }
}
