import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },

    boardOrUniversity: {
      type: String,
      trim: true,
    },

    degree: {
      type: String,
      required: true,
      trim: true,
    },

    fieldOfStudy: {
      type: String,
      trim: true,
    },

    specializations: [
      {
        type: String,
        trim: true,
      },
    ],

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    grade: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

educationSchema.index({ profileId: 1, startDate: -1 });

export const EducationModel =
  mongoose.models.Education || mongoose.model("Education", educationSchema);
