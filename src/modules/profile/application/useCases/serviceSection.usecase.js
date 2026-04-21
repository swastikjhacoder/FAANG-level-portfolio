import { ServiceSectionRepository } from "../../infrastructure/persistence/serviceSection.repository";


export class ServiceSectionUseCase {
  constructor() {
    this.repo = new ServiceSectionRepository();
  }

  async getSection() {
    return await this.repo.get();
  }

  async upsertSection(data) {
    return await this.repo.upsert(data);
  }
}
