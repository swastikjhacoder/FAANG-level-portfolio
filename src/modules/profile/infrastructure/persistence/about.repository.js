import AboutModel from "./about.schema";

export class AboutRepository {
  async get() {
    return AboutModel.findOne();
  }

  async create(data) {
    return AboutModel.create(data);
  }

  async update(data) {
    return AboutModel.findOneAndUpdate({}, data, {
      new: true,
      runValidators: true,
    });
  }

  async upsert(data) {
    return AboutModel.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  }

  async softDelete() {
    return AboutModel.findOneAndUpdate({}, { isDeleted: true }, { new: true });
  }
}
