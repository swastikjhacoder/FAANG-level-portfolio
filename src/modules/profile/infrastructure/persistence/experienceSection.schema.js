import mongoose from "mongoose";

const experienceSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "Experience",
      trim: true,
    },
    subHeading: {
      type: String,
      default: "My professional journey",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

experienceSectionSchema.index({}, { unique: true });

export const ExperienceSectionModel =
  mongoose.models.ExperienceSection ||
  mongoose.model("ExperienceSection", experienceSectionSchema);
