import { AddProjectSectionDTO } from "../dto/addProjectSection.dto";

export class AddProjectSectionUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload, user) {
    const dto = AddProjectSectionDTO.validate(payload);

    return this.repo.upsert(dto.profileId, dto, user.id);
  }
}
