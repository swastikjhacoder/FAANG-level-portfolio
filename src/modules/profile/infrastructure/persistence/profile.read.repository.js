import { ProfileModel } from "./profile.schema.js";
import mongoose from "mongoose";

const lookup = (collection, extraMatch = {}) => ({
  $lookup: {
    from: collection,
    let: { profileId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: { $eq: ["$profileId", "$$profileId"] },
          isDeleted: false,
          ...extraMatch,
        },
      },
      {
        $project: {
          __v: 0,
          isDeleted: 0,
          deletedAt: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      },
    ],
    as: collection,
  },
});

export class ProfileReadRepository {
  async getFullProfile(profileId) {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return null;
    }

    const objectId = new mongoose.Types.ObjectId(profileId);

    const pipeline = [
      {
        $match: {
          _id: objectId,
          isDeleted: false,
        },
      },

      lookup("skills"),
      lookup("experiences"),
      lookup("projects"),
      lookup("testimonials", { approved: true }),

      {
        $project: {
          __v: 0,
          isDeleted: 0,
          deletedAt: 0,
          createdBy: 0,
          updatedBy: 0,
        },
      },
    ];

    const result = await ProfileModel.aggregate(pipeline)
      .allowDiskUse(true)
      .option({ maxTimeMS: 5000 });

    const doc = result[0];
    if (!doc) return null;

    return {
      ...doc,
      skills: doc.skills || [],
      experiences: doc.experiences || [],
      projects: doc.projects || [],
      testimonials: doc.testimonials || [],
    };
  }
}
