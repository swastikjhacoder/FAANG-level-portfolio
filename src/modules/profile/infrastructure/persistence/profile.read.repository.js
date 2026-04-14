import { ProfileModel } from "./profile.schema.js";

export class ProfileReadRepository {
  async getFullProfile(profileId) {
    const result = await ProfileModel.aggregate([
      { $match: { _id: profileId, isDeleted: false } },

      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "profileId",
          as: "skills",
        },
      },
      {
        $lookup: {
          from: "experiences",
          localField: "_id",
          foreignField: "profileId",
          as: "experiences",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "profileId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "testimonials",
          let: { profileId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$profileId", "$$profileId"] },
                approved: true,
              },
            },
          ],
          as: "testimonials",
        },
      },
    ]);

    return result[0] || null;
  }
}
