import AboutModel from "./about.schema";
import connectDB from "@/shared/lib/db";

export class AboutRepository {
  async get() {
    await connectDB();
    return AboutModel.findOne({ isDeleted: false });
  }

  async create(data) {
    await connectDB();
    return AboutModel.create(data);
  }

  async update(data) {
    await connectDB();

    return AboutModel.findOneAndUpdate(
      { singleton: true, isDeleted: false }, // ✅ strict filter
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async upsert(data) {
    await connectDB();

    return AboutModel.findOneAndUpdate({ singleton: true }, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  }

  async softDelete() {
    await connectDB();

    return AboutModel.findOneAndUpdate(
      { singleton: true },
      { isDeleted: true },
      { new: true },
    );
  }
}
