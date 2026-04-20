import mongoose from "mongoose";

const skillSectionSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
      unique: true,
    },

    heading: {
      type: String,
      required: true,
      trim: true,
      default: "Skills",
      maxlength: 100,
    },

    subHeading: {
      type: String,
      trim: true,
      default: "What I bring to the table",
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const SkillSectionModel =
  mongoose.models.SkillSection ||
  mongoose.model("SkillSection", skillSectionSchema);
