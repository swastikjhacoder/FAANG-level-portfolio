import mongoose from "mongoose";

const projectSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },

    subHeading: {
      type: String,
      maxlength: 150,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      maxlength: 150,
      trim: true,
      default: null,
    },

    singleton: {
      type: String,
      default: "PROJECT_SECTION",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

projectSectionSchema.index({ singleton: 1 }, { unique: true });

export const ProjectSectionModel =
  mongoose.models.ProjectSection ||
  mongoose.model("ProjectSection", projectSectionSchema);
