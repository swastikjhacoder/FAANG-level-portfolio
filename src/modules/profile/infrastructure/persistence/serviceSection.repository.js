import { ServiceSectionModel } from "./serviceSection.schema.js";

export class ServiceSectionRepository {
  async get() {
    return await ServiceSectionModel.findOne();
  }

  async upsert(data) {
    return await ServiceSectionModel.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true },
    );
  }
}
