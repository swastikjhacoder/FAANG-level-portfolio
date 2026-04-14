import { ProjectModel } from "./project.schema";

export class ProjectRepository {
  async create(data) {
    return ProjectModel.create(data);
  }

  async findByProfile(profileId) {
    return ProjectModel.find({
      profileId,
      isDeleted: false,
    }).lean();
  }

  async findById(id) {
    return ProjectModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
  }

  async update(id, data) {
    return ProjectModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...data, updatedAt: new Date() },
      { new: true },
    ).lean();
  }

  async delete(id) {
    return ProjectModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).lean();
  }
}
