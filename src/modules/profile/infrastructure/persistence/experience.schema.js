import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },

    startDate: { type: Date, required: true },
    endDate: Date,

    history: [{ type: String }],
    achievements: [{ type: String }],
    projects: [{ type: String }],

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

experienceSchema.index({ profileId: 1, startDate: -1 });

export const ExperienceModel =
  mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
