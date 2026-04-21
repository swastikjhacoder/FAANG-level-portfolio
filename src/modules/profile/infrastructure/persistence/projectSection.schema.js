import mongoose from "mongoose";

const projectSectionSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true,
    },

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const ProjectSectionModel =
  mongoose.models.ProjectSection ||
  mongoose.model("ProjectSection", projectSectionSchema);
