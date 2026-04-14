import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    institution: { type: String, required: true, trim: true },
    boardOrUniversity: { type: String, trim: true },

    degree: String,
    specializations: [{ type: String }],

    startDate: Date,
    endDate: Date,

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

educationSchema.index({ profileId: 1, startDate: -1 });

export const EducationModel =
  mongoose.models.Education || mongoose.model("Education", educationSchema);
