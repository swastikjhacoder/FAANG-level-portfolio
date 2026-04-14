import { ProfileModel } from "./profile.schema.js";
import mongoose from "mongoose";

export class ProfileReadRepository {
  async getFullProfile(profileId) {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return null;
    }

    const objectId = new mongoose.Types.ObjectId(profileId);

    const result = await ProfileModel.aggregate([
      {
        $match: {
          _id: objectId,
          isDeleted: false,
        },
      },

      {
        $lookup: {
          from: "skills",
          let: { profileId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$profileId", "$$profileId"] },
                isDeleted: false,
              },
            },
            { $project: { __v: 0, isDeleted: 0, deletedAt: 0 } },
          ],
          as: "skills",
        },
      },

      {
        $lookup: {
          from: "experiences",
          let: { profileId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$profileId", "$$profileId"] },
                isDeleted: false,
              },
            },
            { $project: { __v: 0, isDeleted: 0, deletedAt: 0 } },
          ],
          as: "experiences",
        },
      },

      {
        $lookup: {
          from: "projects",
          let: { profileId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$profileId", "$$profileId"] },
                isDeleted: false,
              },
            },
            { $project: { __v: 0, isDeleted: 0, deletedAt: 0 } },
          ],
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
                isDeleted: false,
              },
            },
            { $project: { __v: 0, isDeleted: 0, deletedAt: 0 } },
          ],
          as: "testimonials",
        },
      },

      {
        $project: {
          __v: 0,
          isDeleted: 0,
          deletedAt: 0,
        },
      },
    ]);

    return result[0] || null;
  }
}
