import mongoose from "mongoose";

const softSkillSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "GLOBAL_SOFT_SKILL_SECTION",
      unique: true,
    },
    heading: {
      type: String,
      required: true,
      maxlength: 100,
    },
    subHeading: {
      type: String,
      default: "",
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true },
);

export default mongoose.models.SoftSkillSection ||
  mongoose.model("SoftSkillSection", softSkillSectionSchema);
